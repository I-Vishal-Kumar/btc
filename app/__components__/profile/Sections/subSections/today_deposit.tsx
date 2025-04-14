"use client"

import { getTodayDepositWithdrawalUsers } from "@/(backend)/services/user.service.serv"
import { TransactionType } from "@/__types__/db.types"
import { TransactionObjType } from "@/__types__/transaction.types"
import { ActiveTabs } from "@/__types__/ui_types/profil.types"
import { formatDate } from "@/lib/helpers/formatDate"
import { formatNumber } from "@/lib/helpers/numberFormatter"
import { ExpandMore } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, Typography } from "@mui/material"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Fragment, useEffect, useState } from "react"

export const TodayDeposit: React.FC<{ activeTab: ActiveTabs }> = ({ activeTab }) => {

    const [expanded, setExpanded] = useState<string | false>(false);
    // const [data, setData] = useState<Record<string, string>>({});
    const [hasMore, setHasMore] = useState<Record<string, boolean>>({});

    const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false); // Close others when one is opened
    };

    // Extract level number from `expanded` state using Regex
    const level = expanded ? parseInt(expanded.match(/\d+/)?.[0] || "1", 10) : 1;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["deposits", activeTab, level],
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) => getTodayDepositWithdrawalUsers(TransactionType.DEPOSIT, activeTab, pageParam, level),
        getNextPageParam: (lastPage) => lastPage?.data?.length ? (lastPage.pagination?.currentPage || 0) + 1 : undefined,
        enabled: !!expanded,
        staleTime: 60 * 1000,  // Data stays fresh for 1 minute (prevents refetching)
    });

    console.log(hasMore, hasNextPage)
    useEffect(() => {
        if (data?.pages) {
            const latestData = data.pages.at(-1);
            if (!latestData || !latestData.data?.length) {
                setHasMore(prev => ({
                    ...prev,
                    [`level-${ latestData?.pagination?.level }`]: false
                }));
            } else {
                setHasMore((prev) => ({ ...prev, [`level-${ latestData?.pagination?.level }`]: true }));
            }
        }
    }, [data?.pages]);

    return (
        <Box p={2} display={'grid'} rowGap={2}>
            {Array.from({ length: 6 }, (_, i) => `Level ${ i + 1 }`).map((panel, index) => (
                <Accordion sx={{ boxShadow: 0 }} key={panel} expanded={expanded === `Level${ index + 1 }`} onChange={handleChange(`Level${ index + 1 }`)}>

                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>{panel}</Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{ maxHeight: '50vh', overflow: 'auto' }}>
                        {isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <div className="divide-y-8">
                                {data?.pages.map((group, pageIndex) => (
                                    <Fragment key={pageIndex}>
                                        {(group?.data || []).map((transaction) => (
                                            <RenderDepositDetail key={transaction.TransactionID} transaction={transaction} />
                                        ))}
                                    </Fragment>
                                ))}

                                {isFetchingNextPage && <CircularProgress size={24} sx={{ display: "block", mx: "auto", mt: 2 }} />}

                                {hasNextPage && hasMore[`level-${ index + 1 }`] && (
                                    <Button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        {isFetchingNextPage ? "Loading..." : "Load More"}
                                    </Button>
                                )}

                                {
                                    !hasMore[`level-${ index + 1 }`] && <Typography textAlign={"center"}>No more data available.</Typography>
                                }
                            </div>
                        )}
                    </AccordionDetails>

                </Accordion>
            ))}
        </Box>
    )
}

function RenderDepositDetail({ transaction }: { transaction: TransactionObjType }) {
    return (
        <div className="ring-1 ring-slate-300 rounded-md p-2 flex justify-between items-center">
            <div>
                <Typography fontSize={10} fontWeight={550} >{formatDate(new Date(transaction.createdAt), 'dd MMM yyyy HH:mm a')}</Typography>
                <Typography fontSize={10} fontWeight={500} >Phone Number - {transaction.PhoneNumber}</Typography>
            </div>
            <div>
                <Typography fontSize={10} fontWeight={600} >₹ {formatNumber(transaction.Amount)}</Typography>
            </div>
        </div>
    )
}