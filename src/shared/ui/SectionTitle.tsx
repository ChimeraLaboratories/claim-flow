export default function SectionTitle({
                                         title,
                                         right,
                                     }: {
    title: string;
    right?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/70">
            <h2 className="text-sm font-semibold">{title}</h2>
            {right ? <div className="text-sm text-slate-500">{right}</div> : null}
        </div>
    );
}