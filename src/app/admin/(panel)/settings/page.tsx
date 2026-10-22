import { getSettings, SETTING_FIELDS } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Настройки" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Настройки" description="Контакты магазина и тексты, которые не привязаны к товарам." />
      <SettingsForm fields={SETTING_FIELDS} values={settings} />
    </>
  );
}
