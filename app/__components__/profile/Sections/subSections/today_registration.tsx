"use client"


import { getRegistrationDetails } from "@/(backend)/services/user.service.serv";
import { ActiveTabs } from "@/__types__/ui_types/profil.types"
import { UserType } from "@/__types__/user.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, Box, AccordionSummary, Typography, AccordionDetails, CircularProgress, Button } from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect, Fragment } from "react";

export const TodayRegistration: React.FC<{ activeTab: ActiveTabs }> = ({ activeTab }) => {
    const [expanded, setExpanded] = useState<string | false>(false);
    const [hasMore, setHasMore] = useState<Record<string, boolean>>({});

    const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false); // Close others when one is opened
    };

    const level = expanded ? parseInt(expanded.match(/\d+/)?.[0] || "1", 10) : 1;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["registration", activeTab, level],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getRegistrationDetails(activeTab, pageParam, level);
            return { ...response, pageParam };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage?.data?.length ? (lastPage.pagination?.currentPage || 0) + 1 : undefined;
        },
        enabled: !!expanded,
        staleTime: 60 * 1000,
    });

    useEffect(() => {
        if (data?.pages) {
            const latestPage = data.pages.at(-1);
            const levelKey = `level-${ level }`;

            if (!latestPage?.data?.length) {
                setHasMore((prev) => ({ ...prev, [levelKey]: false }));
            } else {
                setHasMore((prev) => ({ ...prev, [levelKey]: true }));
            }
        }
    }, [data?.pages, level]);
    console.log(hasNextPage, hasMore)
    return (
        <Box p={2} display={'grid'} rowGap={2}>
            {Array.from({ length: 6 }, (_, i) => `Level ${ i + 1 }`).map((panel, index) => {
                const panelKey = `Level${ index + 1 }`;
                const levelKey = `level-${ index + 1 }`;
                const isPanelExpanded = expanded === panelKey;

                return (
                    <Accordion
                        sx={{ boxShadow: 0 }}
                        key={panelKey}
                        expanded={isPanelExpanded}
                        onChange={handleChange(panelKey)}
                    >
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
                                            {(group?.data || []).map((user) => (
                                                <RenderRegisteredUserDetail key={user.PhoneNumber} user={user} />
                                            ))}
                                        </Fragment>
                                    ))}

                                    {isFetchingNextPage && (
                                        <CircularProgress size={24} sx={{ display: "block", mx: "auto", mt: 2 }} />
                                    )}

                                    {hasNextPage && hasMore[levelKey] && (
                                        <Button
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            fullWidth
                                            sx={{ mt: 2 }}
                                        >
                                            {isFetchingNextPage ? "Loading..." : "Load More"}
                                        </Button>
                                    )}

                                    {!hasMore[levelKey] && (
                                        <Typography textAlign="center" sx={{ mt: 2 }}>
                                            No more data available.
                                        </Typography>
                                    )}
                                </div>
                            )}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};


function RenderRegisteredUserDetail({ user }: { user: UserType }) {
    return (
        <div className="ring-1 ring-slate-300 rounded-md p-2 flex justify-between items-center">
            <div>
                <Typography fontSize={10} fontWeight={550} >{formatDate(new Date(user?.createdAt || ""), 'dd-MM-yyyy HH:mm a')}</Typography>
                <Typography fontSize={10} fontWeight={500} >Phone Number - {user.PhoneNumber}</Typography>
            </div>
            <div>
                <Typography fontSize={10} fontWeight={600} >₹ {formatNumber(user.Balance)}</Typography>
            </div>
        </div>
    )
}