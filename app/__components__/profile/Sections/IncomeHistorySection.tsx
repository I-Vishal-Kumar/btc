import { getIncomeHistory } from "@/(backend)/services/transaction.service.serve"
import { Income } from "@/__types__/transaction.types"
import AuthForm from "@/app/(public)/getting-started/page"
import { formatDate } from "@/lib/helpers/formatDate"
import { formatNumber } from "@/lib/helpers/numberFormatter"
import { Chip, Typography } from "@mui/material"

export const IncomeHistory: React.FC = async () => {

    const { valid, data } = await getIncomeHistory();
    if (!valid) return <AuthForm />

    return (
        <div className="flex flex-col gap-y-4 p-5">
            {data?.map((income) => (
                <IncomeCard key={income._id} detail={income} />
            ))}
        </div>
    )
}

function IncomeCard({ detail }: {
    detail: Income & {
        giftFrom?: {
            Name: string,
            PhoneNumber: string
        }
    }
}) {
    const ColorMap: Record<Income["Type"], string> = {
        DAILY_INCOME: "#6bd18d",
        REFERAL_INCOME: "#4ba7ff",
        DAILY_GIFT: "#ffbd4b"
    };

    return (
        <div className="p-4 rounded-md ring-1 bg-white ring-gray-300 shadow-sm">
            <Typography variant="caption" fontWeight={600} fontSize={12}>
                {detail.Type.replaceAll("_", " ")}
            </Typography>
            <div className="flex justify-between items-center">
                <Typography fontSize={10} fontWeight={600} color="textDisabled">
                    {formatDate(detail.createdAt, "d MMM, yyyy HH:mm a")}
                </Typography>
                <Typography fontWeight={500} fontSize={14} color="green">
                    +{formatNumber(detail.Amount)}
                </Typography>
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className="max-w-[70%] overflow-hidden">
                    {
                        detail?.giftFrom ? (
                            <>
                                <Typography fontSize={10}>From - {detail.giftFrom.PhoneNumber}</Typography>
                                <Typography fontSize={10}>Name - {detail.giftFrom.Name}</Typography>
                            </>
                        ) : null
                    }
                </div>
                <Chip
                    label={detail.Type.replaceAll('_', " ")}
                    size="small"
                    sx={{
                        bgcolor: ColorMap[detail.Type],
                        color: "white",
                        fontWeight: 600,
                        fontSize: 9,
                        letterSpacing: 0.5
                    }}
                />
            </div>
        </div>
    );
}