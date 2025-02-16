import { claimFD } from "@/(backend)/services/fd.services.serv";
import { FdStatus } from "@/__types__/db.types";
import { FD_type } from "@/__types__/fd.types";
import { calculateFDProfit } from "@/lib/helpers/calcFdProfit";
import { formatDate } from "@/lib/helpers/formatDate";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { Typography, Button, Box } from "@mui/material";
import { DateTime } from "luxon";
import Image from "next/image";
import { ClaimButton } from "./fdClaimButton";

export function TermDepositCard({ fd_detail }: { fd_detail: FD_type }) {

    const expiry_date = DateTime.fromJSDate(new Date(fd_detail.createdAt), { zone: 'UTC' }).plus({ days: fd_detail.FdDuration }).toISO()?.toString() || ""
    const profit = calculateFDProfit(fd_detail.FdAmount, fd_detail.FdDuration, fd_detail.InterestRate);

    return (
        <div className="rounded-xl overflow-hidden ring-1 bg-[#f3f3f3] ring-slate-300">
            <div className="bg-yellow-200 py-2">
                <Typography fontSize={11} textAlign={'center'} fontWeight={600} >Term Deposit</Typography>
            </div>
            <Box mt={2} sx={{ gridTemplateColumns: '1fr 1fr', margin: '2rem auto', width: '90%', display: 'grid' }}>
                <div className="text-[0.65rem] pl-4 font-semibold gap-y-1 grid ">
                    <p>Creation Date {formatDate(fd_detail?.createdAt, 'dd LLL yyyy')}</p>
                    <p>Period - {fd_detail?.FdDuration}days@{fd_detail?.InterestRate}%</p>
                    <p>Investment - {formatNumber(fd_detail?.FdAmount)}</p>
                </div>
                <div className="text-[0.65rem] pl-4 font-semibold gap-y-1 grid">
                    <p>Creation Time- {formatDate(fd_detail.createdAt, 'HH : MM a')}</p>
                    <p>Expiry {formatDate(expiry_date, 'dd LLL yyyy')}</p>
                    <p>Profit- {formatNumber(profit)}</p>
                </div>
            </Box>

            {
                fd_detail?.FdStatus === FdStatus.MATURED && (
                    <ClaimButton _id={fd_detail._id} fd={fd_detail} />
                )
            }

            <div className="flex flex-col text-center pb-4 text-slate-400 text-[0.6rem] px-4 items-center">
                <Image width={60} height={10} src={"/getting-started/logo_full.png"} alt="btc" />
                <p className="mt-4">Investment Agreement</p>
                <p className="mt-2">
                    This document constitutes an actual binding agreement
                    between you, hereinafter referred to as the &quot;Investor,&quot; and BTC
                    Construction Inc. (the &quot;Company&quot;), regarding the Investor&apos;s intent
                    to invest/trade in the Company. This agreement is executed
                    under the provisions of Section 10 of the Companies Act, 2013,
                    and both parties commit to fulfilling the terms outlined herein.
                    The parties agree to proceed with the necessary steps for
                    investment under applicable laws and regulations. This
                    agreement is binding and enforceable upon execution.
                </p>
                <p className="mt-2">BTC Construction Inc.</p>
            </div>
        </div>
    )
}
