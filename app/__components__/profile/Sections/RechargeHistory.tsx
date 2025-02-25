import { getTransactionDetails } from "@/(backend)/services/transaction.service.serve"
import { TransactionStatusType, TransactionType } from "@/__types__/db.types"
import { TransactionObjType } from "@/__types__/transaction.types"
import AuthForm from "@/app/(public)/getting-started/page"
import { formatDate } from "@/lib/helpers/formatDate"
import LineClamp from "@/lib/helpers/lineClamper"
import { formatNumber } from "@/lib/helpers/numberFormatter"
import { Chip, Typography } from "@mui/material"

export const RechargeHistory: React.FC = async () => {

    const { valid, data } = await getTransactionDetails(TransactionType.DEPOSIT);

    if (!valid) return <AuthForm />

    return (
        <div className=" flex flex-col gap-y-4 p-5">
            {
                data?.map(detail => (
                    <RechargeCard key={detail._id} detail={detail} />
                ))
            }
        </div>
    )
}

function RechargeCard({ detail }: { detail: TransactionObjType }) {

    const Color = {
        [TransactionStatusType.SUCCESS]: '#51ff97',
        [TransactionStatusType.PENDING]: '#ffd04b',
        [TransactionStatusType.FAILED]: '#ff5c4b'
    }

    return (
        <div className="p-4 rounded-md ring-1 bg-gray-100 ring-gray-300">
            <Typography variant="caption" fontWeight={600} fontSize={12}>Deposit</Typography>
            <div className="flex justify-between items-center">
                <Typography fontSize={10} fontWeight={600} color="textDisabled">
                    {formatDate(detail.createdAt, "d MMM, yyyy HH:MM a")}
                </Typography>
                <Typography fontWeight={500} fontSize={12}>
                    {formatNumber(detail.Amount)}
                </Typography>
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className=" max-w-[60%] overflow-clip">
                    <LineClamp maxLines={1}>
                        <Typography fontSize={11}>Transaction Id - {detail.TransactionID}</Typography>
                    </LineClamp>
                    <LineClamp maxLines={1}>
                        <Typography fontSize={11}>Recharge Method - {detail?.Method || "BTC"}</Typography>
                    </LineClamp>
                </div>
                <Chip label={detail.Status} size={"small"} sx={{ bgcolor: Color[detail.Status], letterSpacing: 1, color: 'white', fontWeight: 600, fontSize: 9 }} />
            </div>
        </div>
    )
}