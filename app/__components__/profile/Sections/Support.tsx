import { Box, Typography } from "@mui/material"

export const Support: React.FC = () => {
    return (
        <div>
            <div className="h-[30vh] w-full bg-[url(/assets/support_bg.jpg)] bg-cover bg-bottom bg-no-repeat">
            </div>
            <Box px={4} mt={4}>
                <Typography fontWeight={600} mt={2}>Support & Contact Number</Typography>
                <div className="bg-slate-200 rounded-md p-3 mt-6 ring-1 ring-slate-300">
                    Telegram Group
                </div>
                <div className="bg-slate-200 rounded-md p-3 mt-6 ring-1 ring-slate-300">
                    Telegram Agent
                </div>
                <div className="bg-slate-200 rounded-md p-3 mt-6 ring-1 ring-slate-300">
                    Contact Number
                </div>
            </Box>
        </div>
    )
}