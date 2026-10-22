"use client";

import { useActionState } from "react";
import { buttonClass } from "@/lib/ui";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="text-sm font-semibold">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="mt-1.5 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-ink"
        />
      </div>
      {state.error && <p className="text-sm font-semibold text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
        {pending ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
