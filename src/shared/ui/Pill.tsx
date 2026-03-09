export default function Pill({
                                 children,
                                 tone,
                             }: {
    children: React.ReactNode;
    tone: "slate" | "blue" | "amber" | "green" | "red";
}) {
    const styles = {
        slate:
            "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
        blue:
            "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
        amber:
            "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
        green:
            "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
        red:
            "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
    };

    return (
        <span
            className={[
                "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                styles[tone],
            ].join(" ")}
        >
      {children}
    </span>
    );
}