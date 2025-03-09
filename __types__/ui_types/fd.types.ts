export const OPTIONS = {
    '3day@2%'      : { max: 50_000, min : 100 },
    '4day@2.2%'    : { max: 100_000, min : 50_001 },
    '5day@2.4%'   : { max: 200_000, min : 100_001 },
    '6day@3%'     : { max: 10_00_000, min: 200_001 },
} as const;

export type OptionTypes = keyof typeof OPTIONS;