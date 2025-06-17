import { FdStatus as statusType } from "@/__types__/db.types";
import { FD_type } from "@/__types__/fd.types";
import { calculateFDProfit } from "@/lib/helpers/calcFdProfit";
import { formatDate } from "@/lib/helpers/formatDate";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { Typography, Box } from "@mui/material";
import { DateTime } from "luxon";
import Image from "next/image";
import { ClaimButton } from "./fdClaimButton";
import BookButton from "./bookButton";
import { useMemo } from "react";

export function TermDepositCard({ fd_detail }: { fd_detail: FD_type }) {

    const {
        FdAmount,
        FdDuration,
        InterestRate,
        FdStatus,
        createdAt,
        LastClaimedOn,
        Claimed,
    } = fd_detail;

    const createdDate = useMemo(() => DateTime.fromJSDate(new Date(createdAt)).toUTC().startOf("day"), [createdAt]);
    const lastClaimedDate = useMemo(() => DateTime.fromJSDate(new Date(LastClaimedOn)).startOf("day"), [LastClaimedOn]);
    const today = useMemo(() => DateTime.now().startOf("day"), []);
    const expiryDate = useMemo(() => createdDate.plus({ days: FdDuration }), [createdDate, FdDuration]);

    const isHalted = FdStatus === statusType.HALTED;

    const referenceDate = useMemo(() => (isHalted ? lastClaimedDate : today), [isHalted, lastClaimedDate, today]);

    const daysDiff = useMemo(
        () => Math.floor(Math.max(expiryDate.diff(referenceDate, 'days').days, 1)),
        [expiryDate, referenceDate]
    );

    const profit = useMemo(() => {
        return isHalted
            ? calculateFDProfit(FdAmount, daysDiff, 2.6)
            : calculateFDProfit(FdAmount, FdDuration, InterestRate);
    }, [FdAmount, daysDiff, FdDuration, InterestRate, isHalted]);

    const isClaimAvailable = useMemo(() => {
        const claimedToday = lastClaimedDate.equals(today);
        const statusAllowsClaim = !([statusType.CLAIMED, statusType.HALTED] as string[]).includes(FdStatus as string);
        return statusAllowsClaim || (!claimedToday && !Claimed);
    }, [FdStatus, lastClaimedDate, today, Claimed]);

    const plainFD = useMemo(() => (JSON.parse(JSON.stringify(fd_detail))), [fd_detail]);

    return (
        <div className="rounded-xl overflow-hidden ring-1 bg-[#f3f3f3] ring-slate-300">
            <div className="bg-yellow-200 py-2">
                <Typography fontSize={11} textAlign="center" fontWeight={600}>Term Deposit</Typography>
            </div>

            <Box mt={2} sx={{ gridTemplateColumns: '1fr 1fr', margin: '2rem auto', width: '90%', display: 'grid' }}>
                <div className="text-[0.65rem] pl-4 font-semibold gap-y-1 grid">
                    <p>Creation Date - {formatDate(createdAt, 'dd LLL yyyy')}</p>
                    <p>Period - {FdDuration} days @ {InterestRate}%</p>
                    <p>Investment - {formatNumber(FdAmount)}</p>
                    <p>{isHalted ? "Booked On" : "Last claimed on"} - {formatDate(LastClaimedOn, 'dd LLL yyyy HH:mm a')}</p>
                </div>
                <div className="text-[0.65rem] pl-4 font-semibold gap-y-1 grid">
                    <p>Creation Time - {formatDate(createdAt, 'HH : mm a')}</p>
                    <p>Expiry - {formatDate(expiryDate.toISO()!, 'dd LLL yyyy')}</p>
                    <p>Profit - {formatNumber(profit)}</p>
                </div>
            </Box>

            {(isClaimAvailable && FdStatus !== statusType.HALTED) && <ClaimButton _id={plainFD._id} fd={plainFD} />}
            <BookButton fd={plainFD} />

            <div className="flex flex-col text-center pb-4 text-slate-400 text-[0.6rem] px-4 items-center">
                <Image width={60} height={10} src="/getting-started/logo_full.png" alt="btc" />
                <p className="mt-4">Investment Agreement</p>
                <p className="mt-2 font-bold">
                    This document constitutes an actual binding agreement
                    between you, hereinafter referred to as the &quot;Investor,&quot; and BTC
                    Construction Inc. (the &quot;Company&quot;), regarding the Investor&apos;s intent
                    to invest/trade in the Company...
                </p>
                <p className="mt-2">BTC Construction Inc.</p>
            </div>
        </div>
    );
}

