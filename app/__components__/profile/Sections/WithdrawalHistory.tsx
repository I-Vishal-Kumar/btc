import LineClamp from "@/lib/helpers/lineClamper"
import { formatNumber } from "@/lib/helpers/numberFormatter"
import { Chip, Typography } from "@mui/material"

export const WithdrawalHistory: React.FC = () => {
    return (
        <div className=" flex flex-col gap-y-4 p-5">
            <WithdrawalCard />
            <WithdrawalCard />
            <WithdrawalCard />
            <WithdrawalCard />
        </div>
    )
}

function WithdrawalCard() {
    return (
        <div className="p-2 rounded-md ring-1 bg-gray-100 ring-gray-300">
            <Typography variant="caption" fontWeight={600} fontSize={12}>Withdrawal</Typography>
            <div className="flex justify-between items-center">
                <Typography fontSize={10} color="textDisabled">
                    12/01/2032 12:01
                </Typography>
                <Typography fontWeight={500} fontSize={12}>
                    {formatNumber(800)}
                </Typography>
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className=" max-w-[60%] overflow-clip">
                    <LineClamp maxLines={1}>
                        <Typography fontSize={11}>Transaction Id - 928397429387slkdfj;a skdjf49283</Typography>
                    </LineClamp>
                    <LineClamp maxLines={1}>
                        <Typography fontSize={11}>Transaction fee - channel 1</Typography>
                    </LineClamp>
                </div>
                <Chip label="Pending" size="small" sx={{ bgcolor: 'blue', color: 'white', fontWeight: 600, fontSize: 11, py: 0.1 }} />
            </div>
        </div>
    )
}