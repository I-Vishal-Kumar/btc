
"use client"

import { ActiveTabs } from "@/__types__/ui_types/profil.types"
import { formatNumber } from "@/lib/helpers/numberFormatter"
import { ExpandMore } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, Typography } from "@mui/material"
import { useState } from "react"

export const TodayDeposit: React.FC<{ activeTab: ActiveTabs }> = ({ activeTab }) => {

    const [expanded, setExpanded] = useState<string | false>(false);
    const [data, setData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false); // Close others when one is opened
    };

    return (
        <Box p={2} display={'grid'} rowGap={2}>
            {Array.from({ length: 6 }, (_, i) => `Level ${ i + 1 }`).map((panel, index) => (
                <Accordion sx={{ boxShadow: 0 }} key={panel} expanded={expanded === `Level${ index }`} onChange={handleChange(`Level${ index }`)}>

                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>{panel}</Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{ maxHeight: '50vh', overflow: 'auto' }}>
                        {loading[`Level${ index }`] ? (
                            <CircularProgress size={24} />
                        ) : (
                            <div className="divide-y-8">
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                                <RenderDepositDetail />
                            </div>
                        )}
                    </AccordionDetails>

                </Accordion>
            ))}
        </Box>
    )
}

function RenderDepositDetail() {
    return (
        <div className="ring-1 ring-slate-300 rounded-md p-2 flex justify-between items-center">
            <div>
                <Typography fontSize={10} fontWeight={550} >11/12/1232</Typography>
                <Typography fontSize={10} fontWeight={500} >Phone Number - 29387492387</Typography>
            </div>
            <div>
                <Typography fontSize={10} fontWeight={600} >₹ {formatNumber(123423)}</Typography>
            </div>
        </div>
    )
}