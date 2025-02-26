"use client"


import LineClamp from "@/lib/helpers/lineClamper";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { USER_CONTEXT } from "@/lib/hooks/user.context";
import { WALLET_CONTEXT } from "@/lib/hooks/userWallet.context";
import { CheckCircle, Dangerous } from "@mui/icons-material";
import { Avatar, Typography } from "@mui/material";
import Image from "next/image";
import { useContext } from "react";

export default function PaymentCard({ client = 'funds' }: { client?: 'commission' | 'funds' }) {

    const { userInfo } = useContext(USER_CONTEXT);

    return (
        <div className="relative grid pt-8 gap-y-4 items-end z-0 w-full rounded-2xl">
            <Avatar src="/assets/man.png" sx={{ margin: '0 auto', height: { xs: 90, md: 100 }, width: { xs: 90, md: 100 }, bgcolor: '#b9ebc3', mt: 1 }} >A</Avatar>
            <div className="flex flex-col justify-center ">
                <Typography fontWeight={600} fontFamily={'serif'} sx={{ color: 'black', textAlign: 'center' }}>{userInfo.Name}</Typography>
                <Typography sx={{ color: 'white', textAlign: 'center' }}>{userInfo.PhoneNumber}</Typography>
            </div>
            {
                client === 'funds' ? (
                    <DisplayFunds />
                ) : <DisplayCommission commission={userInfo.Commission} />
            }
            <Image src={'/assets/test.png'} style={{ objectFit: 'fill' }} className="z-[-1]" fill alt="bg" />

        </div>
    )

}

function DisplayFunds() {
    const { wallet } = useContext(WALLET_CONTEXT);
    return (
        <div className="flex py-2 pb-4 justify-center">
            <Typography fontWeight={600} fontSize={11} color="white">Linked Account Number - </Typography>
            <LineClamp maxLines={1}>
                <Typography fontWeight={600} fontSize={11} ml={1} color="white">{wallet?.AccNumber}</Typography>
            </LineClamp>
            {
                wallet.AccNumber ? (
                    <CheckCircle sx={{ color: "black", ml: 1, fontSize: 15 }} />
                ) : (
                    <Dangerous sx={{ color: "black", ml: 1, fontSize: 15 }} />
                )
            }
        </div>

    )
}

function DisplayCommission({ commission }: { commission: number }) {
    return (
        <div className="flex py-2 pb-4 justify-center">
            <Typography fontWeight={600} fontSize={11} color="white">Total Commission Earned - </Typography>
            <LineClamp maxLines={1}>
                <Typography fontWeight={600} fontSize={11} ml={1} color="white">{formatNumber(commission)}</Typography>
            </LineClamp>
        </div>
    )
}