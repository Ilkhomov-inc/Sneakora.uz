import clsx from "clsx";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Small building blocks shared by admin pages and forms.

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-stone hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 text-stone">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ title, description, className, children }: { title?: string; description?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={clsx("rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(18,18,18,0.04)] md:p-6", className)}>
      {title && <h2 className="font-semibold">{title}</h2>}
      {description && <p className="mt-1 text-sm text-stone">{description}</p>}
      <div className={clsx(title && "mt-5")}>{children}</div>
    </section>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-stone/60 focus:border-ink disabled:bg-sand";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-stone">{hint}</p>}
      {error && <p className="mt-1 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}

export function Toggle({
  name,
  label,
  checked,
  defaultChecked,
  onChange,
}: {
  name?: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="peer sr-only"
      />
      <span className="relative h-6 w-10 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-ink peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-cobalt" />
      {label}
    </label>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "green" | "blue" | "orange" | "red"; children: React.ReactNode }) {
  const tones = {
    neutral: "bg-sand text-ink",
    green: "bg-[#E3F5EE] text-[#0B7A55]",
    blue: "bg-[#E8ECFF] text-cobalt-deep",
    orange: "bg-[#FFEDE5] text-[#C2410C]",
    red: "bg-[#FDE8E7] text-danger",
  };
  return <span className={clsx("inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-dashed border-line bg-white/50 p-10 text-center text-stone">{children}</div>;
}
