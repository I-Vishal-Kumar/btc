"use client"


import { ad_getDepositTransactions, ad_settleDeposit } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { Box, Button, Container, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

export const DepositTransaction: React.FC = () => {

    const [TransactionID, setTransactionId] = useState('');
    const [hasMore, setHasMore] = useState(true);

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['admin', 'search_transaction', TransactionID],
        mutationFn: () => ad_getDepositTransactions({ TransactionID })
    })

    const {
        data: depositTransactions,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["deposits", 'transactions'],
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) => ad_getDepositTransactions({ page: pageParam }),
        getNextPageParam: (lastPage) => {
            return lastPage?.data?.length ? (lastPage.pagination?.currentPage || 0) + 1 : undefined;
        },
        enabled: true,
        staleTime: 60 * 1000,  // Data stays fresh for 1 minute (prevents refetching)
    });

    useEffect(() => {
        if (depositTransactions?.pages) {
            const latestData = depositTransactions.pages.at(-1);
            setHasMore(!!latestData?.data?.length);
        }
    }, [depositTransactions?.pages]);

    return (
        <Container disableGutters sx={{ margin: '0 auto', py: 4, display: 'flex', justifyContent: 'center' }}>
            <Box width={'90%'}>

                <InputLabel>Referance Number</InputLabel>

                <TextField value={TransactionID} onChange={e => setTransactionId(e.target.value)} fullWidth size="small" variant="outlined" slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <Button disabled={isPending} onClick={() => mutate()} size="small" variant="contained">Submit</Button>
                            </InputAdornment>
                        )
                    }
                }} />

                {/* search result. */}
                <Box py={2} border={1} p={1} mt={2} borderRadius={2}>
                    {
                        isSuccess && data?.data && (
                            <>
                                <Typography fontWeight={600}>Search result</Typography>
                                {
                                    (data.data || []).map((details, i) => (
                                        <RenderDepositTransaction index={`${ i + 1 }`} key={details._id} details={details} />
                                    ))
                                }
                            </>
                        )
                    }
                </Box>

                <Box mt={4}>

                    {
                        depositTransactions?.pages.map((detail, page) => {
                            return (detail?.data || []).map((transaction, i) => (
                                <RenderDepositTransaction index={`${ page + 1 }.${ i + 1 }`} key={transaction._id} details={transaction} />
                            ))
                        })
                    }

                    {hasNextPage && hasMore && (
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
                        !hasMore && <Typography mt={4} textAlign={"center"}>No more data available.</Typography>
                    }
                </Box>

            </Box>
        </Container>
    )
}

function RenderDepositTransaction({ index, details }: { index: string, details: TransactionObjType }) {

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(details);

    const handleChange = (field: keyof TransactionObjType, value: string | number) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    };

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['settle_deposit', details._id],
        mutationFn: ad_settleDeposit
    })

    const handleSubmit = () => {
        setIsEditing(false);
        mutate(editedData)
    }

    useEffect(() => {
        if (!isPending && isSuccess && data?.valid) {
            enqueueSnackbar(data.msg, { variant: 'success' });
        } else if (!isPending && isSuccess && !data?.valid) {
            enqueueSnackbar(data.msg || 'something went wrong', { variant: 'error' });
        }
    }, [isSuccess, isPending])

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '0.1fr 1fr',
                gridTemplateRows: '1fr auto',
                gap: 1
            }}
            boxShadow={1}
            borderRadius={1}
            p={1}
            mt={4}
        >
            {/* Index */}
            <Typography fontWeight={700}>{index}</Typography>

            <Box px={1} display="grid" gap={1}>
                {/* Created At */}
                <TextField
                    label="Created At"
                    value={formatDate(new Date(details.createdAt), 'dd-MM-yyyy hh:mm a')}
                    size="small"
                    disabled
                    fullWidth
                />

                {/* Phone Number */}
                <TextField
                    label="Phone Number"
                    value={details.PhoneNumber}
                    size="small"
                    disabled
                    fullWidth
                />

                {/* Amount */}
                <TextField
                    label="Amount"
                    value={editedData.Amount}
                    onChange={(e) => handleChange('Amount', Number(e.target.value))}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography>
                                        {editedData.Method === 'USDT' ? '$' : '₹'}
                                    </Typography>
                                </InputAdornment>
                            )
                        }
                    }}
                    size="small"
                    fullWidth
                    disabled={!isEditing}
                />

                {/* method */}
                <TextField
                    label="Method"
                    value={editedData?.Method}
                    onChange={(e) => handleChange('Method', Number(e.target.value))}
                    size="small"
                    fullWidth
                    disabled={!isEditing}
                />

                {/* Transaction ID */}
                <TextField
                    label="Transaction ID"
                    value={editedData.TransactionID}
                    onChange={(e) => handleChange('TransactionID', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!isEditing}
                />

                {/* Status Dropdown */}
                <Select
                    value={editedData.Status}
                    onChange={(e) => handleChange('Status', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!isEditing}
                >
                    <MenuItem value={TransactionStatusType.PENDING}>Pending</MenuItem>
                    <MenuItem value={TransactionStatusType.SUCCESS}>Success</MenuItem>
                    <MenuItem value={TransactionStatusType.FAILED}>Failed</MenuItem>
                </Select>
            </Box>

            {/* Buttons */}
            <Box
                display="flex"
                justifyContent="space-evenly"
                alignItems="flex-end"
                pt={1}
                sx={{ gridColumn: 'span 2' }}
            >
                {isEditing ? (
                    <>
                        <Button disabled={isPending} size="small" variant="contained" color="success" onClick={handleSubmit}>
                            Submit
                        </Button>
                        <Button disabled={isPending} size="small" variant="contained" color="error" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button disabled={isPending} size="small" variant="contained" onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
}