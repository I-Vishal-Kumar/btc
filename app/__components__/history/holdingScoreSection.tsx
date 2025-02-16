"use client"

import { formatNumber } from "@/lib/helpers/numberFormatter";
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { Typography } from "@mui/material"
import { useContext } from "react"

export function HoldingScoreSection() {

    const { userInfo } = useContext(USER_CONTEXT);

    return (
        <>
            {/* holding score */}
            <div className=" bg-[#f3f3f3] ring-1 ring-slate-300 p-4 rounded-md">

                <Typography sx={{ fontWeight: 600, textAlign: 'center', fontSize: 10 }}>Holding Score - {formatNumber(userInfo.HoldingScore)}</Typography>

                <p className="text-xs mt-4 text-slate-500" >Withdrawal fee depends on your holding score:</p>
                <ul className="list-disc text-xs pl-5 text-slate-500">
                    <li>Above 600 10% fee.</li>
                    <li>Below 600 15% fee.</li>
                    <li>You earn 10 credits per day based on your investment.</li>
                    <li>With ODI, you get extra benefits and a lower 5% withdrawal fee.</li>
                </ul>
            </div>
        </>
    )
}
