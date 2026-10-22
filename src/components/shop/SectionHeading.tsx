import clsx from "clsx";

export function SectionHeading({
  title,
  lead,
  action,
  className,
}: {
  title: string;
  lead?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mb-6 flex items-end justify-between gap-4 md:mb-8", className)}>
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-[2rem]">{title}</h2>
        {lead && <p className="mt-2 max-w-xl text-stone">{lead}</p>}
      </div>
      {action}
    </div>
  );
}
