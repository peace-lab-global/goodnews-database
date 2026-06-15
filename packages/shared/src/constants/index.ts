import type { Topic } from "../types";

export const DEFAULT_TOPICS: Omit<Topic, "id">[] = [
  {
    slug: "ai-industry",
    name_zh: "AI行业",
    name_en: "AI Industry",
    description_zh: "人工智能行业重大进展与趋势",
    description_en: "Major developments and trends in the AI industry",
    icon_url: null,
    color: "#10B981",
    is_default: true,
    is_active: true,
    sort_order: 1,
  },
  {
    slug: "ai-agent",
    name_zh: "AI Agent",
    name_en: "AI Agent",
    description_zh: "AI智能体与自主系统的前沿突破",
    description_en: "Breakthroughs in AI agents and autonomous systems",
    icon_url: null,
    color: "#8B5CF6",
    is_default: true,
    is_active: true,
    sort_order: 2,
  },
  {
    slug: "ai-infra",
    name_zh: "AI基础设施",
    name_en: "AI Infra",
    description_zh: "AI基础设施、芯片、训练与推理平台",
    description_en: "AI infrastructure, chips, training and inference platforms",
    icon_url: null,
    color: "#F59E0B",
    is_default: true,
    is_active: true,
    sort_order: 3,
  },
  {
    slug: "ai-app",
    name_zh: "AI应用",
    name_en: "AI App",
    description_zh: "AI应用产品的创新与落地",
    description_en: "Innovation and deployment of AI application products",
    icon_url: null,
    color: "#3B82F6",
    is_default: true,
    is_active: true,
    sort_order: 4,
  },
];

export const SENTIMENT_THRESHOLDS = {
  POSITIVE_MIN: 0.3,
  TIER_1_MIN: 0.8,
  TIER_2_MIN: 0.5,
  TIER_3_MIN: 0.3,
} as const;

export const FEED_PAGE_SIZE = 20;

export const APP_NAME = "Good News";
export const APP_NAME_ZH = "好消息";
