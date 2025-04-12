"use client"


import { ad_getWithdrawalTransactions, ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { adminWithdrawalRespType } from "@/__types__/transaction.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { Box, Button, Container, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

export const Withdrawal: React.FC = () => {

    const [TransactionID, setTransactionId] = useState('');
    const [hasMore, setHasMore] = useState(true);

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['admin', 'search_transaction', TransactionID],
        mutationFn: () => ad_getWithdrawalTransactions({ TransactionID })
    })

    const {
        data: depositTransactions,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["deposits", 'transactions'],
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) => ad_getWithdrawalTransactions({ page: pageParam }),
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
                            <Box>
                                <Typography fontWeight={600}>Search result</Typography>
                                {
                                    (data.data || []).map((details, i) => (
                                        <RenderWithdrawalTransaction index={`${ i + 1 }`} key={details._id} details={details} />
                                    ))
                                }
                            </Box>
                        )
                    }
                </Box>

                <Box mt={4}>

                    {
                        depositTransactions?.pages.map((detail, page) => {
                            return (detail?.data || []).map((transaction, i) => (
                                <RenderWithdrawalTransaction index={`${ page + 1 }.${ i + 1 }`} key={transaction._id} details={transaction} />
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

function RenderWithdrawalTransaction({ index, details }: { index: string, details: adminWithdrawalRespType }) {

    const [isEditing, setIsEditing] = useState(false);
    const [loadingPayout, setPayout] = useState(false);
    const [editedData, setEditedData] = useState(details);

    const handleChange = (field: keyof adminWithdrawalRespType, value: string | number) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    };

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['settle_withdrawal', details._id],
        mutationFn: ad_settleWithdrawal
    })

    const handleSubmit = () => {
        setIsEditing(false);
        mutate(editedData)
    }

    const handleAutoPayout = async () => {
        setPayout(true);
        try {
            const res = await axios.post("/api/payment/AUTO_WITHDRAW", {
                payout: {
                    UserID: 82,
                    Token: 'cf029b8702ae6c8a55e0f97bcf5980cf',
                    OutletID: 10065,
                    PayoutRequest: {
                        AccountNo: editedData.walletDetails.AccNumber,
                        AmountR: editedData.Amount - (Number(editedData.Amount || 0) / 100 * (editedData?.Tax || 0)),
                        BankID: 1,
                        IFSC: editedData.walletDetails.IfscCode?.toUpperCase(),
                        SenderMobile: '8092528285',
                        SenderName: 'Shravan',
                        SenderEmail: "parlourfootball@gmail.com",
                        BeneName: editedData.walletDetails.AccHolderName,
                        BeneMobile: editedData.PhoneNumber,
                        APIRequestID: editedData.TransactionID,
                        SPKey: 'IMPS',
                    },
                },
                editedData
            })
            if (res.data.valid) {
                enqueueSnackbar(res.data.msg, { variant: 'success' });
            } else {
                enqueueSnackbar(res.data.msg, { variant: 'error' });
            }
        } catch (error) {
            alert(JSON.stringify(error));
        } finally {

            setPayout(false);

        }


    }

    useEffect(() => {
        if (!isPending && isSuccess && data?.valid) {
            enqueueSnackbar(data.msg, { variant: 'success' });
        } else if (!isPending && isSuccess && !data?.valid) {
            enqueueSnackbar(data.msg || 'something went wrong', { variant: 'error' });
        }
    }, [isSuccess, isPending])

    const taxAmount = (Number(editedData.Amount || 0) * Number(editedData.Tax)) / 100;
    const amountAfterTaxLocal = Number(editedData.Amount || 0) - taxAmount;
    const amountAfterTaxUsdt = amountAfterTaxLocal / 80;

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
                    size="small"
                    fullWidth
                    disabled={!isEditing}
                />

                {/* Amount after tax */}
                <TextField
                    label="Amount"
                    value={editedData.Method === 'USDT' ? amountAfterTaxUsdt : amountAfterTaxLocal}
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
                    disabled
                />

                {/* method */}
                <TextField
                    label="Method"
                    value={editedData?.Method}
                    onChange={(e) => handleChange('Method', e.target.value)}
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
                {
                    isEditing && (
                        <Box>
                            {
                                Object.entries(details.walletDetails || {}).map(([key, value]) => (
                                    <div key={key} className="flex gap-x-3 p-1">
                                        <Typography sx={{ color: 'blueviolet' }}>{key} -&gt;</Typography>
                                        {
                                            key === 'createdAt' ? (
                                                <Typography>{formatDate(new Date(value as string), 'dd MMM yyyy hh : ss a')}</Typography>
                                            ) : (
                                                <Typography>{String(value)}</Typography>
                                            )
                                        }
                                    </div>
                                ))
                            }
                        </Box>
                    )
                }
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
                        <Button disabled={isPending || loadingPayout} size="small" variant="contained" color="success" onClick={handleSubmit}>
                            Submit
                        </Button>
                        <Button disabled={isPending || loadingPayout} size="small" variant="contained" color="secondary" onClick={handleAutoPayout}>
                            Approve Gateway
                        </Button>
                        <Button disabled={isPending || loadingPayout} size="small" variant="contained" color="error" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button disabled={isPending || loadingPayout} size="small" variant="contained" onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
}