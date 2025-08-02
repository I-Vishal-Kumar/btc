"use client"
import LineClamp from "@/lib/helpers/lineClamper"
import { ArrowBackIos } from "@mui/icons-material"
import { Box, Typography } from "@mui/material"
import { useRouter } from "next/navigation"

export const Header: React.FC<{ title: string }> = ({ title }) => {
    const router = useRouter();
    return (
        <Box sx={{ display: 'grid', py: 1.5, px: 2, gridTemplateColumns: '0.5fr 1fr 0.5fr', my: 1, bgcolor: '#f3f3f3', outline: 1, outlineColor: '#e4e4e4' }}>
            <div
                onClick={() => router.back()}
                className="w-full flex items-center cursor-pointer ">
                <ArrowBackIos sx={{ fontSize: 12 }} />
                <Typography fontSize={13}>back</Typography>
            </div>
            <div className="w-full">
                <LineClamp>
                    <Typography textAlign={'center'} textTransform={"capitalize"} fontWeight={600} fontSize={15}>{title.replaceAll("_", " ")}</Typography>
                </LineClamp>
            </div>
            <div className="w-full"></div>
        </Box>
    )
}