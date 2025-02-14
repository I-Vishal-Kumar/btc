import { Box, Container, Typography } from "@mui/material"
import { Header } from "../header/Header"
import { formatNumber } from "@/lib/helpers/numberFormatter"
import Image from "next/image"

export const History: React.FC = () => {
    return (
        <Container disableGutters sx={{ pt: 2 }}>
            <Header title="Trade History" />
            <Box sx={{ p: 3 }}>
                <HoldingScoreSection />
                <div className="mt-10 grid gap-y-8">
                    <TermDepositCard />
                    <TermDepositCard />
                    <TermDepositCard />
                </div>
            </Box>
        </Container>
    )
}

function TermDepositCard() {
    return (
        <div className="rounded-xl overflow-hidden ring-1 bg-[#f3f3f3] ring-slate-300">
            <div className="bg-yellow-200 py-2">
                <Typography fontSize={11} textAlign={'center'} fontWeight={600} >Term Deposit</Typography>
            </div>
            <Box mt={2} sx={{ gridTemplateColumns: '1fr 1fr', margin: '2rem auto', width: '90%', display: 'grid' }}>
                <div className="text-[0.65rem] pl-4 font-semibold gap-y-1 grid ">
                    <p>Creation Date 21 Jan 2025</p>
                    <p>Period - 2 years@2%</p>
                    <p>Investment - {formatNumber(1923)}</p>
                </div>
                <div className="text-[0.65rem] pl-4 font-semibold gap-y-1 grid">
                    <p>Creation Time- 9:10 AM</p>
                    <p>Expiry 21 Jan 2025</p>
                    <p>Profit- {formatNumber(28323)}</p>
                </div>
            </Box>
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

function HoldingScoreSection() {
    return (
        <>
            {/* holding score */}
            <div className=" bg-[#f3f3f3] ring-1 ring-slate-300 p-4 rounded-md">

                <Typography sx={{ fontWeight: 600, textAlign: 'center', fontSize: 10 }}>Holding Score - 600</Typography>

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
