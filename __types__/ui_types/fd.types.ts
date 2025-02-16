export const OPTIONS = {
    '15day@2%'      : { max: 10_000 },
    '30day@2.5%'    : { max: 40_000 },
    '60day@3%'      : { max: 60_000 },
    '180day@5%'     : { max: 100_000 },
    '365day@7%'     : { max: 200_000 },
    '730day@10%'    : { max: 300_000 },
    '1095day@15%'   : { max: 400_000 },
}

export type OptionTypes = keyof typeof OPTIONS;