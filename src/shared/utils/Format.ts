export function formatGBP(value: number): string {
    return Number(value || 0).toLocaleString("en-GB", {
        style: "currency",
        currency: "GBP",
    });
}

export function formatDate(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB");
}