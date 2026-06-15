-- Migration 001: Initial Schema for Good News App

create extension if not exists "pg_trgm";

-- ─── PROFILES ───────────────────────────────────────────
create table public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    username    text unique,
    nickname    text,
    avatar_url  text,
    locale      text not null default 'zh-CN',
    platform    text not null default 'mobile',
    push_enabled boolean not null default true,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- ─── TOPICS ─────────────────────────────────────────────
create table public.topics (
    id          uuid primary key default gen_random_uuid(),
    slug        text unique not null,
    name_zh     text not null,
    name_en     text not null,
    description_zh text,
    description_en text,
    icon_url    text,
    color       text default '#10B981',
    is_default  boolean not null default false,
    is_active   boolean not null default true,
    sort_order  int not null default 0,
    created_at  timestamptz not null default now()
);

-- ─── RSS SOURCES ────────────────────────────────────────
create table public.rss_sources (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    url             text unique not null,
    site_url        text,
    language        text not null default 'en',
    category        text,
    fetch_interval_minutes int not null default 60,
    is_active       boolean not null default true,
    last_fetched_at timestamptz,
    error_count     int not null default 0,
    last_error      text,
    created_at      timestamptz not null default now()
);

-- ─── NEWS ARTICLES ──────────────────────────────────────
create table public.news_articles (
    id              uuid primary key default gen_random_uuid(),
    source_id       uuid references public.rss_sources(id),
    source_url      text not null,
    source_name     text not null,
    guid            text unique not null,
    title           text not null,
    title_zh        text,
    summary_zh      text,
    summary_en      text,
    content_text    text,
    image_url       text,
    author          text,
    published_at    timestamptz not null,
    language        text not null default 'en',
    sentiment_score float not null default 0,
    sentiment_label text not null default 'pending',
    positivity_tier int not null default 0,
    is_published    boolean not null default false,
    ai_processed_at timestamptz,
    ai_model        text,
    duplicate_of    uuid references public.news_articles(id),
    quality_score   float default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ─── ARTICLE TOPICS (many-to-many) ─────────────────────
create table public.article_topics (
    article_id  uuid references public.news_articles(id) on delete cascade,
    topic_id    uuid references public.topics(id) on delete cascade,
    relevance   float not null default 1.0,
    primary key (article_id, topic_id)
);

-- ─── USER TOPIC SUBSCRIPTIONS ──────────────────────────
create table public.user_topic_subscriptions (
    user_id     uuid references public.profiles(id) on delete cascade,
    topic_id    uuid references public.topics(id) on delete cascade,
    sort_order  int not null default 0,
    created_at  timestamptz not null default now(),
    primary key (user_id, topic_id)
);

-- ─── USER SAVED ARTICLES ───────────────────────────────
create table public.user_saved_articles (
    user_id     uuid references public.profiles(id) on delete cascade,
    article_id  uuid references public.news_articles(id) on delete cascade,
    created_at  timestamptz not null default now(),
    primary key (user_id, article_id)
);

-- ─── USER READ HISTORY ─────────────────────────────────
create table public.user_read_history (
    user_id     uuid references public.profiles(id) on delete cascade,
    article_id  uuid references public.news_articles(id) on delete cascade,
    read_at     timestamptz not null default now(),
    primary key (user_id, article_id)
);

-- ─── INDEXES ────────────────────────────────────────────
create index idx_articles_published on public.news_articles(published_at desc) where is_published = true;
create index idx_articles_sentiment on public.news_articles(sentiment_label, sentiment_score desc);
create index idx_articles_source on public.news_articles(source_id, published_at desc);
create index idx_articles_guid on public.news_articles(guid);
create index idx_articles_title_trgm on public.news_articles using gin (title gin_trgm_ops);
create index idx_articles_title_zh_trgm on public.news_articles using gin (title_zh gin_trgm_ops);
create index idx_article_topics_topic on public.article_topics(topic_id);
create index idx_subscriptions_user on public.user_topic_subscriptions(user_id);

-- ─── UPDATED_AT TRIGGER ────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
    before update on public.profiles
    for each row execute function public.handle_updated_at();

create trigger on_articles_updated
    before update on public.news_articles
    for each row execute function public.handle_updated_at();

-- ─── AUTO-PROVISION NEW USERS ──────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, nickname, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );
    insert into public.user_topic_subscriptions (user_id, topic_id)
    select new.id, id from public.topics where is_default = true;
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ─── ROW LEVEL SECURITY ────────────────────────────────
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.news_articles enable row level security;
alter table public.article_topics enable row level security;
alter table public.user_topic_subscriptions enable row level security;
alter table public.user_saved_articles enable row level security;
alter table public.user_read_history enable row level security;
alter table public.rss_sources enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "topics_select" on public.topics for select using (is_active = true);

create policy "articles_select_published" on public.news_articles
    for select using (is_published = true);

create policy "article_topics_select" on public.article_topics
    for select using (
        exists (select 1 from public.news_articles where id = article_id and is_published = true)
    );

create policy "subscriptions_all_own" on public.user_topic_subscriptions
    for all using (auth.uid() = user_id);

create policy "saved_articles_all_own" on public.user_saved_articles
    for all using (auth.uid() = user_id);

create policy "read_history_all_own" on public.user_read_history
    for all using (auth.uid() = user_id);

create policy "rss_sources_select" on public.rss_sources
    for select using (auth.role() = 'authenticated');
