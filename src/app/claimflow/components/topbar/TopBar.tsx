"use client";

import { useTrackerStore } from "../../store/trackerStore";

function prettyMonth(value: string) {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
    });
}

export default function TopBar() {
    const month = useTrackerStore((state) => state.month);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/90">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-white" />
                    <div>
                        <div className="text-sm font-semibold">ChimeraLabs</div>
                        <div className="text-xs text-slate-500">
                            NHS Invoice Tracker
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
                    {prettyMonth(month)}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Synced
                </div>
            </div>
        </header>
    );
}