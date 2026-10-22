import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "uz"],
  defaultLocale: "ru",
  // Russian lives at "/", Uzbek at "/uz/...". Add "en" here (and messages/en.json) to add English.
  localePrefix: "as-needed",
});
