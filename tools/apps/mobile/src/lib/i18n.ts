import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { zhCN, enUS } from "@goodnews/shared";
import * as Localization from "expo-localization";

const deviceLocale = Localization.getLocales()[0]?.languageTag || "zh-CN";
const isChinese = deviceLocale.startsWith("zh");

i18n.use(initReactI18next).init({
  resources: {
    "zh-CN": { translation: zhCN },
    "en-US": { translation: enUS },
  },
  lng: isChinese ? "zh-CN" : "en-US",
  fallbackLng: "zh-CN",
  interpolation: { escapeValue: false },
});

export default i18n;
