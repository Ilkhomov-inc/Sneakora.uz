import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Вход" };

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-sm">
        <Logo />
        <h1 className="mt-6 font-display text-xl font-semibold">Вход в админку</h1>
        <p className="mt-1 text-sm text-stone">Введите общий пароль магазина.</p>
        <LoginForm />
      </div>
    </div>
  );
}
