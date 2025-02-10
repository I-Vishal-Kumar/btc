"use client"
import { formatNumber } from "@/lib/helpers/numberFormatter"
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { Box, Typography } from "@mui/material"
import { useContext } from "react"
import { MdOutlineCurrencyRupee } from "react-icons/md"

export const RenderBalance: React.FC = () => {
    const { userInfo } = useContext(USER_CONTEXT);
    return (
        <Box pl={0.5} pr={1} py={0.5} boxShadow={1} display={'flex'} columnGap={1} alignItems={'center'} borderRadius={4} bgcolor={'#f0eb76'}>
            <div className='rounded-full w-fit text-gray-700 p-0.5 bg-slate-100 '>
                <MdOutlineCurrencyRupee />
            </div>
            <Typography fontSize={12} fontWeight={600} >{formatNumber(userInfo.Balance)}</Typography>
        </Box>
    )
}