export const OPTIONS = {
    '360day@2%'      : { max: 50_000, min : 100 },
    '360day@2.2%'    : { max: 100_000, min : 50_001 },
    '720day@2.4%'   : { max: 200_000, min : 100_001 },
    '1800day@3%'     : { max: 10_00_000, min: 200_001 },
} as const;

export type OptionTypes = keyof typeof OPTIONS;