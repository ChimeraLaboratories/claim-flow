import { create } from "zustand";
import type { InvoiceStatus } from "../types/tracker";

type TrackerState = {
    month: string;
    authorityId: string;
    search: string;
    statuses: Record<InvoiceStatus, boolean>;

    setMonth: (value: string) => void;
    setAuthorityId: (value: string) => void;
    setSearch: (value: string) => void;
    toggleStatus: (status: InvoiceStatus) => void;
    reset: () => void;
};

const DEFAULT_STATUSES: Record<InvoiceStatus, boolean> = {
    DRAFT: true,
    ISSUED: true,
    PART_PAID: true,
    PAID: true,
    OVERDUE: true,
    CANCELLED: false,
};

export const useTrackerStore = create<TrackerState>((set) => ({
    month: "2026-03",
    authorityId: "All",
    search: "",
    statuses: { ...DEFAULT_STATUSES },

    setMonth: (value) => set({ month: value }),
    setAuthorityId: (value) => set({ authorityId: value }),
    setSearch: (value) => set({ search: value }),
    toggleStatus: (status) =>
        set((state) => ({
            statuses: {
                ...state.statuses,
                [status]: !state.statuses[status],
            },
        })),
    reset: () =>
        set({
            month: "2026-03",
            authorityId: "All",
            search: "",
            statuses: { ...DEFAULT_STATUSES },
        }),
}));