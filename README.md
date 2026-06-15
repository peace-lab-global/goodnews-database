# Good News / 好消息

> 只显示好消息的全平台 AI 新闻聚合器。

一套代码，覆盖 iOS、Android、Web、Mac、Windows、Chrome 扩展六大平台。通过 AI 自动从 RSS 源中筛选正面新闻，生成中英文摘要，只让你看到好消息。

## 目录

- [核心特性](#核心特性)
- [技术架构](#技术架构)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [数据库设计](#数据库设计)
- [AI 新闻流水线](#ai-新闻流水线)
- [应用界面](#应用界面)
- [Chrome 扩展](#chrome-扩展)
- [开发指南](#开发指南)
- [构建部署](#构建部署)
- [路线图](#路线图)

## 核心特性

- **AI 情感过滤** — DeepSeek/Llama 自动打分，只发布正面新闻（得分 >= 0.3）
- **中英双语摘要** — AI 自动生成 2-3 句中文/英文摘要 + 中文标题翻译
- **话题订阅** — 默认 4 个 AI 话题，支持用户自定义扩展
- **实时推送** — Supabase Realtime，新文章入库即刻推送到客户端
- **离线阅读** — React Query 持久化缓存，断网也能看已加载的文章
- **六端覆盖** — iOS / Android / Web / Mac / Windows / Chrome 扩展

## 技术架构

| 层 | 技术 | 说明 |
|---|---|---|
| **移动端** | React Native 0.76 + Expo SDK 52 | 文件路由 (expo-router)、EAS Build |
| **Web** | Expo Web + react-native-web | 同一代码库，响应式布局 |
| **桌面端** | EAS Build (Mac/Windows) | 通过 Expo 打包原生壳 |
| **Chrome 扩展** | Manifest V3 + Vite + React | 独立构建，共享 Supabase 后端 |
| **微信小程序** | Taro 4 (React) | Phase 3，REST API 接入 |
| **后端** | Supabase | Auth + PostgreSQL + Edge Functions + Realtime |
| **AI 模型** | DeepSeek / Llama (OpenAI 兼容 API) | 情感分析 + 话题分类 + 摘要生成 |
| **Monorepo** | pnpm 9 + Turborepo | 4 个 workspace，共享类型和工具 |
| **状态管理** | TanStack React Query + Zustand | 服务端状态用 Query，客户端用 Zustand |
| **国际化** | i18next | 中文 / 英文，跟随设备语言 |
| **本地存储** | expo-secure-store + Zustand persist | Session 持久化，安全存储 |

## 项目结构

```
goodnews/
├── package.json                  # Monorepo 根配置
├── pnpm-workspace.yaml           # 工作区定义
├── turbo.json                    # Turborepo 流水线
├── tsconfig.base.json            # 共享 TypeScript 配置
├── eslint.config.mjs             # ESLint flat config
├── .env.example                  # 环境变量模板
│
├── apps/
│   ├── mobile/                   # Expo 应用 (iOS/Android/Web/Mac/Windows)
│   │   ├── app/                  # Expo Router 文件路由
│   │   │   ├── _layout.tsx       # 根布局 (Auth 守卫 + Provider)
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx     # 登录 (邮箱/密码 + 魔法链接)
│   │   │   │   └── register.tsx  # 注册
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx   # Tab 导航 (首页/话题/我的)
│   │   │   │   ├── index.tsx     # 首页 Feed (无限滚动 + 话题筛选)
│   │   │   │   ├── topics.tsx    # 话题管理 (订阅/取消)
│   │   │   │   └── profile.tsx   # 个人中心 (统计/设置/登出)
│   │   │   └── article/
│   │   │       └── [id].tsx      # 文章详情 (AI摘要 + WebView原文)
│   │   ├── src/
│   │   │   ├── components/       # UI 组件
│   │   │   │   ├── NewsCard.tsx        # 新闻卡片 (hero/compact 两种样式)
│   │   │   │   ├── TopicChip.tsx       # 话题筛选芯片
│   │   │   │   ├── LoadingSkeleton.tsx # 加载骨架屏
│   │   │   │   └── EmptyState.tsx      # 空状态占位
│   │   │   ├── hooks/
│   │   │   │   ├── useNewsFeed.ts      # Feed 数据 + 话题 + 订阅 + 统计
│   │   │   │   └── useRealtimeNews.ts  # Supabase Realtime 订阅
│   │   │   ├── lib/
│   │   │   │   ├── supabase.ts         # Supabase 客户端实例
│   │   │   │   └── i18n.ts            # i18next 初始化
│   │   │   └── stores/
│   │   │       └── authStore.ts        # Zustand + SecureStore 持久化
│   │   ├── app.json              # Expo 配置
│   │   ├── eas.json              # EAS Build 配置
│   │   ├── metro.config.js       # Metro 打包 (monorepo 解析)
│   │   └── babel.config.js       # Babel (含 reanimated 插件)
│   │
│   └── chrome-extension/         # Chrome 扩展 (Manifest V3)
│       ├── manifest.json         # MV3 清单
│       ├── vite.config.ts        # Vite + @crxjs/vite-plugin
│       ├── src/
│       │   ├── background/
│       │   │   └── index.ts      # Service Worker (15分钟轮询)
│       │   ├── popup/
│       │   │   ├── App.tsx       # 弹窗 UI (新闻列表)
│       │   │   └── index.html
│       │   └── options/
│       │       ├── App.tsx       # 设置页 (登录 + 话题订阅管理)
│       │       └── index.html
│       └── public/icons/         # 扩展图标 (16/48/128px)
│
├── packages/
│   ├── shared/                   # 共享包
│   │   └── src/
│   │       ├── types/            # TypeScript 类型定义
│   │       │   └── index.ts      # NewsArticle, Topic, AIClassifyResult 等
│   │       ├── constants/
│   │       │   └── index.ts      # 默认话题、情感阈值、分页大小
│   │       └── i18n/
│   │           ├── zh-CN.ts      # 中文翻译
│   │           └── en-US.ts      # 英文翻译
│   │
│   └── supabase-client/          # Supabase 客户端工厂
│       └── src/
│           ├── client.ts         # createClient 封装
│           ├── queries.ts        # 预构建查询 (Feed/详情/话题)
│           └── realtime.ts       # Realtime 订阅封装
│
└── supabase/
    ├── config.toml               # Supabase 本地开发配置
    ├── seed.sql                  # 种子数据 (4 话题 + 14 RSS 源)
    ├── migrations/
    │   └── 001_initial_schema.sql # 完整数据库 Schema
    └── functions/
        ├── deno.json             # Deno import map
        ├── rss-ingest/index.ts   # RSS 抓取 + 全文提取
        ├── ai-classify/index.ts  # 情感分析 + 话题标签
        └── ai-summarize/index.ts # 中英文摘要 + 标题翻译
```

## 快速开始

### 前置条件

- **Node.js** >= 18
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Supabase CLI** (`brew install supabase/tap/supabase`)
- **Docker** (Supabase 本地运行需要)
- **Expo Go** 或 **EAS CLI** (移动端开发)

### 安装

```bash
# 1. 克隆项目
git clone https://github.com/peace-lab-global/goodnews.git
cd goodnews

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/chrome-extension/.env.example apps/chrome-extension/.env
# 编辑各 .env 文件填入真实的密钥

# 4. 启动 Supabase 本地开发环境
supabase start

# 5. 运行数据库迁移 + 种子数据
supabase db reset

# 6. 启动移动端 (iOS/Android/Web 三选一)
cd apps/mobile
pnpm dev              # 默认启动 (选择平台)
pnpm dev:web          # 仅 Web

# 7. 启动 Chrome 扩展开发
cd apps/chrome-extension
pnpm dev              # Vite dev server
# 然后在 chrome://extensions 加载 unpacked 目录
```

### 手动触发 AI 流水线

```bash
# 抓取 RSS
supabase functions invoke rss-ingest

# AI 分类 (处理 pending 状态的文章)
supabase functions invoke ai-classify

# AI 摘要 (为已发布的正面文章生成摘要)
supabase functions invoke ai-summarize
```

## 环境变量

### 根目录 `.env`

| 变量 | 说明 | 示例 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 公钥 | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥 (仅 Edge Functions) | `eyJ...` |
| `AI_API_BASE_URL` | AI 模型 API 地址 | `https://api.deepseek.com/v1` |
| `AI_API_KEY` | AI 模型 API 密钥 | `sk-...` |
| `AI_MODEL` | 模型名称 | `deepseek-chat` |

### `apps/mobile/.env`

| 变量 | 说明 |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase URL (本地开发: `http://127.0.0.1:54321`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 密钥 |

### `apps/chrome-extension/.env`

| 变量 | 说明 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 密钥 |
| `VITE_WEB_URL` | Web 应用地址 (用于点击跳转) |

## 数据库设计

### Schema 总览 (8 张表)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  profiles   │     │ user_topic_      │     │   topics    │
│ (扩展 users) │◄────│ subscriptions    │────►│ (话题定义)   │
└─────────────┘     └──────────────────┘     └──────┬──────┘
       │                                            │
       │            ┌──────────────────┐            │
       ├────────────│ user_saved_      │            │
       │            │ articles         │            │
       │            └────────┬─────────┘            │
       │                     │                      │
       │            ┌────────▼─────────┐     ┌──────▼──────┐
       ├────────────│ user_read_       │     │  article_   │
       │            │ history          │     │  topics     │
       │            └────────┬─────────┘     └──────┬──────┘
       │                     │                      │
       │            ┌────────▼──────────────────────▼──────┐
       │            │         news_articles                 │
       │            │ (核心: 标题/摘要/情感/话题/发布状态)    │
       │            └────────┬─────────────────────────────┘
       │                     │
       │            ┌────────▼─────────┐
       └───────────►│   rss_sources    │
                    │ (RSS 数据源管理)  │
                    └──────────────────┘
```

### 关键字段

**news_articles**
| 字段 | 类型 | 说明 |
|---|---|---|
| `title` / `title_zh` | text | 原标题 / AI 翻译中文标题 |
| `summary_zh` / `summary_en` | text | AI 生成的中文/英文摘要 |
| `sentiment_score` | float | -1.0 (极负面) ~ +1.0 (极正面) |
| `sentiment_label` | text | `positive` / `neutral` / `negative` / `pending` |
| `positivity_tier` | int | 1=极好, 2=好, 3=不错, 0=非正面 |
| `is_published` | boolean | 仅正面文章为 true，对客户端可见 |
| `guid` | text (unique) | RSS item GUID，用于去重 |

### RLS 策略

- `news_articles`: 仅 `is_published = true` 的文章可被客户端读取
- `user_topic_subscriptions` / `user_saved_articles` / `user_read_history`: 仅本人可操作
- `topics`: 所有已激活话题可读
- `profiles`: 本人可更新，所有人可读

### 自动触发器

- **新用户注册** → 自动创建 `profiles` 行 → 自动订阅所有默认话题

## AI 新闻流水线

```
                    ┌─────────────────────────────────────────┐
                    │           Supabase Edge Functions        │
                    │              (Deno Runtime)              │
                    └─────────────────────────────────────────┘

  RSS Feeds ─────►  rss-ingest (每30分钟)
  (14个源)            │
                      ├─ 解析 XML (rss-parser)
                      ├─ GUID 去重
                      ├─ Cheerio 提取全文
                      └─ 写入 news_articles (sentiment_label='pending')
                                │
                                ▼
                    ai-classify (批量处理 pending 文章)
                      │
                      ├─ DeepSeek/Llama 情感分析
                      ├─ 打分: sentiment_score (-1 ~ +1)
                      ├─ 分级: positivity_tier (1/2/3/0)
                      ├─ 话题标签: 匹配到 4 个默认话题
                      └─ score >= 0.3 → is_published = true ✓
                                │
                                ▼
                    ai-summarize (仅处理已发布的正面文章)
                      │
                      ├─ 生成 summary_zh (中文摘要 2-3句)
                      ├─ 生成 summary_en (英文摘要 2-3句)
                      └─ 生成 title_zh (中文标题翻译)
```

### AI Prompt 策略

**情感分析 (ai-classify)**:
- 仅识别真正的正面新闻：突破、进步、有益发展、鼓舞人心的故事
- 产品发布 = 中性，融资轮 = 中性（除非有明确的正面影响）
- 返回结构化 JSON：分数、标签、级别、话题关联度

**摘要生成 (ai-summarize)**:
- 聚焦三要素：**发生了什么** / **为什么重要** / **谁会受益**
- 中文摘要自然流畅，非机翻风格
- 英文文章自动翻译中文标题

### 预置 RSS 数据源 (14个)

| 来源 | 语言 | 分类 | 频率 |
|---|---|---|---|
| MIT Technology Review - AI | EN | AI行业 | 60min |
| The Verge - AI | EN | AI行业 | 60min |
| TechCrunch - AI | EN | AI行业 | 60min |
| Ars Technica - AI | EN | AI行业 | 120min |
| VentureBeat - AI | EN | AI行业 | 60min |
| 36Kr - AI | ZH | AI行业 | 60min |
| 机器之心 | ZH | AI行业 | 60min |
| 量子位 | ZH | AI行业 | 120min |
| OpenAI Blog | EN | AI应用 | 120min |
| Google AI Blog | EN | AI行业 | 120min |
| Hugging Face Blog | EN | AI基础设施 | 120min |
| Anthropic Blog | EN | AI行业 | 120min |
| LangChain Blog | EN | AI Agent | 120min |
| The Batch (Andrew Ng) | EN | AI行业 | 1440min (日更) |

## 应用界面

### 首页 Feed

- 顶部横向滚动话题芯片 (全部 / AI行业 / AI Agent / AI基础设施 / AI应用)
- 第一条新闻用 **Hero 卡片** (大图)，后续用 **Compact 卡片** (左文右图)
- 无限滚动加载 (每页 20 条)
- 下拉刷新
- Supabase Realtime 实时推送新文章
- 情感徽章：🟢 极好 / 🟢 好消息 / 🟢 不错

### 文章详情

- Hero 大图 + AI 摘要卡片 (绿色背景)
- 相关话题标签
- "阅读原文" 按钮 → WebView 加载原文
- 收藏功能 (书签)
- 自动记录阅读历史

### 话题管理

- 网格布局显示已订阅和推荐话题
- 彩色圆点标识话题颜色
- 一键订阅/取消

### 个人中心

- 阅读统计 (已读/收藏篇数)
- 语言切换 (中文/英文)
- 每日推送开关
- 已保存文章列表

## Chrome 扩展

- **Manifest V3** + Vite 构建
- **Background Service Worker**: 每 15 分钟轮询 Supabase，缓存最新 20 条新闻
- **Popup**: 紧凑新闻列表，点击跳转文章详情
- **Options 页面**: Supabase Auth 登录 + 话题订阅管理
- **Badge**: 显示未读新闻数量

## 开发指南

### Monorepo 脚本

```bash
# 根目录
pnpm dev          # 启动所有 workspace 的 dev
pnpm build        # 构建所有 workspace
pnpm lint         # 运行所有 lint
pnpm typecheck    # 运行所有类型检查
pnpm gen:types    # 从 Supabase 生成 TypeScript 类型

# 数据库
pnpm db:reset     # 重置本地数据库 (迁移 + 种子)
pnpm db:migrate   # 运行迁移
pnpm db:seed      # 运行种子数据
```

### 添加新的 RSS 数据源

```sql
-- 在 Supabase Studio (localhost:54323) 或通过 SQL
INSERT INTO rss_sources (name, url, site_url, language, category, fetch_interval_minutes)
VALUES (
  'Your Source Name',
  'https://example.com/rss',
  'https://example.com',
  'en',          -- 'en' 或 'zh'
  'ai-industry', -- 对应话题 slug
  60             -- 抓取间隔 (分钟)
);
```

### 添加新话题

```sql
INSERT INTO topics (slug, name_zh, name_en, description_zh, description_en, color, is_default, sort_order)
VALUES (
  'ai-healthcare',
  'AI + 医疗',
  'AI + Healthcare',
  'AI在医疗领域的突破',
  'AI breakthroughs in healthcare',
  '#EC4899',
  false,  -- 非默认订阅
  5
);
```

### 调整情感阈值

编辑 `packages/shared/src/constants/index.ts`:

```typescript
export const SENTIMENT_THRESHOLDS = {
  POSITIVE_MIN: 0.3,   // 最低发布阈值 (降低 = 更多文章)
  TIER_1_MIN: 0.8,     // 极好
  TIER_2_MIN: 0.5,     // 好
  TIER_3_MIN: 0.3,     // 不错
} as const;
```

同步修改 `supabase/functions/ai-classify/index.ts` 中的判断逻辑。

## 构建部署

### 移动端 (EAS Build)

```bash
cd apps/mobile

# iOS
eas build --platform ios --profile preview

# Android
eas build --platform android --profile preview

# Web
npx expo export --platform web
# 产物在 dist/ 目录，部署到任意静态托管
```

### Chrome 扩展

```bash
cd apps/chrome-extension
pnpm build
# 产物在 dist/ 目录
# 在 Chrome Web Store Developer Dashboard 上传 dist.zip
```

### Supabase 生产部署

```bash
# 部署 Edge Functions
supabase functions deploy rss-ingest
supabase functions deploy ai-classify
supabase functions deploy ai-summarize

# 设置生产环境变量 (Supabase Secrets)
supabase secrets set AI_API_KEY=sk-xxx AI_MODEL=deepseek-chat
```

## 路线图

### Phase 1: MVP (当前)

- [x] Monorepo 基础设施
- [x] Supabase 数据库 Schema + RLS + 触发器
- [x] 3 个 Edge Functions (RSS 抓取 / AI 分类 / AI 摘要)
- [x] Expo 应用 (首页 / 话题 / 个人中心 / 文章详情)
- [x] 认证流程 (邮箱/密码 + 魔法链接)
- [x] Chrome 扩展 (Popup + Options)
- [x] 中英双语 i18n

### Phase 2: 打磨 + Web + Chrome

- [ ] 推送通知 + daily-digest Edge Function
- [ ] 离线支持 (React Query 持久化)
- [ ] 全文搜索 (pg_trgm)
- [ ] 分享卡片生成
- [ ] Expo Web 响应式优化

### Phase 3: 桌面 + 微信小程序

- [ ] Mac / Windows 桌面应用 (EAS Build)
- [ ] 微信小程序 (Taro 4 + REST API + 微信登录)
- [ ] 用户自定义话题 (关键词规则)
- [ ] RSS 源提交 + 审核队列

### Phase 4: 智能 + 增长

- [ ] 智能排序 (positivity_tier + 用户互动信号)
- [ ] 每周精选邮件
- [ ] 管理后台 (内容审核)
- [ ] 数据分析 (话题/来源 效果追踪)

## 许可证

MIT
