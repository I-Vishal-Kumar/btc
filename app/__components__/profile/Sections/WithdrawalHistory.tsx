"use client"


import { getUserWithdrawalDetails } from "@/(backend)/services/user.service.serv"
import LineClamp from "@/lib/helpers/lineClamper"
import { formatNumber } from "@/lib/helpers/numberFormatter"
import { Chip, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import SkeletonDashboard from "../../_loader/skeletonLoader"
import AuthForm from "@/app/(public)/getting-started/page"
import { TransactionObjType } from "@/__types__/transaction.types"
import { formatDate } from "@/lib/helpers/formatDate"
import { TransactionStatusType } from "@/__types__/db.types"

export const WithdrawalHistory: React.FC = () => {

    const { data, isLoading } = useQuery({
        queryKey: ["my-withdrawals"],
        queryFn: getUserWithdrawalDetails,
        staleTime: 60 * 1000,  // 1 min before refetch
    });

    if (isLoading) return <SkeletonDashboard />
    if (!data?.valid) return <AuthForm />

    return (
        <div className=" flex flex-col gap-y-4 p-5">
            {
                (data.data || []).map(transaction => (
                    <WithdrawalCard key={transaction._id} transaction={transaction} />
                ))
            }
            {
                !data.data || !data.data.length && <Typography textAlign={'center'}>No data avialable</Typography>
            }
        </div>
    )
}

function WithdrawalCard({ transaction }: { transaction: TransactionObjType }) {
    const Color = {
        [TransactionStatusType.SUCCESS]: '#51ff97',
        [TransactionStatusType.PENDING]: '#ffd04b',
        [TransactionStatusType.FAILED]: '#ff5c4b'
    }
    return (
        <div className="p-2 rounded-md ring-1 bg-gray-100 ring-gray-300">
            <Typography variant="caption" fontWeight={600} fontSize={12}>Withdrawal</Typography>
            <div className="flex justify-between items-center">
                <Typography fontSize={10} color="textDisabled">
                    {formatDate(new Date(transaction.createdAt), 'dd LLL yyyy hh:mm a')}
                </Typography>
                <Typography fontWeight={500} fontSize={12}>
                    {formatNumber(transaction.Amount)}
                </Typography>
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className=" max-w-[60%] overflow-clip">
                    <LineClamp maxLines={1}>
                        <Typography fontSize={11}>Transaction Id - {transaction.TransactionID}</Typography>
                    </LineClamp>
                    <LineClamp maxLines={1}>
                        <Typography fontSize={11}>Transaction fee - {transaction.Tax}</Typography>
                    </LineClamp>
                </div>
                <Chip label={transaction.Status} size="small" sx={{ bgcolor: Color[transaction.Status], color: 'white', fontWeight: 600, fontSize: 11, py: 0.1 }} />
            </div>
        </div>
    )
}