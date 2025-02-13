import LineClamp from "@/lib/helpers/lineClamper";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { CheckCircle } from "@mui/icons-material";
import { Avatar, Typography } from "@mui/material";
import Image from "next/image";

export default function PaymentCard({ client = 'funds' }: { client?: 'commission' | 'funds' }) {
    return (
        <div className="relative grid pt-8 gap-y-4 items-end z-0 w-full rounded-2xl">
            <Avatar src="/assets/man.png" sx={{ margin: '0 auto', height: { xs: 90, md: 100 }, width: { xs: 90, md: 100 }, bgcolor: '#b9ebc3', mt: 1 }} >A</Avatar>
            <div className="flex flex-col justify-center ">
                <Typography fontWeight={600} fontFamily={'serif'} sx={{ color: 'black', textAlign: 'center' }}>Name</Typography>
                <Typography sx={{ color: 'white', textAlign: 'center' }}>984759384</Typography>
            </div>
            {
                client === 'funds' ? (
                    <DisplayFunds />
                ) : <DisplayCommission />
            }
            <Image src={'/assets/test.png'} style={{ objectFit: 'fill' }} className="z-[-1]" fill alt="bg" />

        </div>
    )

}

function DisplayFunds() {
    return (
        <div className="flex py-2 pb-4 justify-center">
            <Typography fontWeight={600} fontSize={11} color="white">Linked Account Number - </Typography>
            <LineClamp maxLines={1}>
                <Typography fontWeight={600} fontSize={11} ml={1} color="white">29837409283740</Typography>
            </LineClamp>
            <CheckCircle sx={{ color: "black", ml: 1, fontSize: 15 }} />
        </div>


    )
}

function DisplayCommission() {
    return (
        <div className="flex py-2 pb-4 justify-center">
            <Typography fontWeight={600} fontSize={11} color="white">Total Commission Earned - </Typography>
            <LineClamp maxLines={1}>
                <Typography fontWeight={600} fontSize={11} ml={1} color="white">{formatNumber(298347)}</Typography>
            </LineClamp>
        </div>
    )
}