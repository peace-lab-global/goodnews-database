-- Seed: Default Topics
insert into public.topics (slug, name_zh, name_en, description_zh, description_en, color, is_default, sort_order) values
    ('ai-industry', 'AI行业', 'AI Industry', '人工智能行业重大进展与趋势', 'Major developments and trends in the AI industry', '#10B981', true, 1),
    ('ai-agent', 'AI Agent', 'AI Agent', 'AI智能体与自主系统的前沿突破', 'Breakthroughs in AI agents and autonomous systems', '#8B5CF6', true, 2),
    ('ai-infra', 'AI基础设施', 'AI Infra', 'AI基础设施、芯片、训练与推理平台', 'AI infrastructure, chips, training and inference platforms', '#F59E0B', true, 3),
    ('ai-app', 'AI应用', 'AI App', 'AI应用产品的创新与落地', 'Innovation and deployment of AI application products', '#3B82F6', true, 4)
on conflict (slug) do nothing;

-- Seed: RSS Sources (AI-focused feeds)
insert into public.rss_sources (name, url, site_url, language, category, fetch_interval_minutes) values
    ('MIT Technology Review - AI', 'https://www.technologyreview.com/topic/artificial-intelligence/feed', 'https://www.technologyreview.com', 'en', 'ai-industry', 60),
    ('The Verge - AI', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'https://www.theverge.com', 'en', 'ai-industry', 60),
    ('TechCrunch - AI', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'https://techcrunch.com', 'en', 'ai-industry', 60),
    ('Ars Technica - AI', 'https://feeds.arstechnica.com/arstechnica/technology-lab', 'https://arstechnica.com', 'en', 'ai-industry', 120),
    ('VentureBeat - AI', 'https://venturebeat.com/category/ai/feed/', 'https://venturebeat.com', 'en', 'ai-industry', 60),
    ('36Kr - AI', 'https://36kr.com/feed-informationflow', 'https://36kr.com', 'zh', 'ai-industry', 60),
    ('机器之心', 'https://www.jiqizhixin.com/rss', 'https://www.jiqizhixin.com', 'zh', 'ai-industry', 60),
    ('量子位', 'https://www.qbitai.com/feed', 'https://www.qbitai.com', 'zh', 'ai-industry', 120),
    ('OpenAI Blog', 'https://openai.com/blog/rss.xml', 'https://openai.com', 'en', 'ai-app', 120),
    ('Google AI Blog', 'https://blog.google/technology/ai/rss/', 'https://blog.google', 'en', 'ai-industry', 120),
    ('Hugging Face Blog', 'https://huggingface.co/blog/feed.xml', 'https://huggingface.co', 'en', 'ai-infra', 120),
    ('Anthropic Blog', 'https://www.anthropic.com/feed.xml', 'https://www.anthropic.com', 'en', 'ai-industry', 120),
    ('LangChain Blog', 'https://blog.langchain.dev/rss/', 'https://blog.langchain.dev', 'en', 'ai-agent', 120),
    ('The Batch (Andrew Ng)', 'https://www.deeplearning.ai/the-batch/feed/', 'https://www.deeplearning.ai', 'en', 'ai-industry', 1440)
on conflict (url) do nothing;
