export const OPTIONS = {
    "360day@1%": { max: 3_50_000 - 1, min: 500 },
    "720day@2.2%": { max: 6_50_000 - 1, min: 3_50_000 },
    "1800day@2.4%": { max: 15_00_000, min: 6_50_000 },
} as const;

export type OptionTypes = keyof typeof OPTIONS;
