import { Box, Typography } from "@mui/material"
import Link from "next/link"

export const Support: React.FC = () => {
    return (
        <div>
            <div className="h-[30vh] w-full bg-[url(/assets/support_bg.jpg)] bg-cover bg-bottom bg-no-repeat">
            </div>
            <Box px={4} mt={4}>
                <Typography fontWeight={600} mt={2}>Support & Contact Number</Typography>
                <Link href="https://t.me/+IzSkZkmM6sMxYTJl" target="_blank">
                    <div className="bg-slate-200 rounded-md p-3 mt-6 ring-1 ring-slate-300 cursor-pointer">
                        Telegram Group
                    </div>
                </Link>
                <Link href="https://t.me/BTC_CS_SUPPORT" target="_blank">
                    <div className="bg-slate-200 rounded-md p-3 mt-6 ring-1 ring-slate-300 cursor-pointer">
                        Telegram Agent
                    </div>
                </Link>
                <Link href="https://chat.whatsapp.com/G6QfOA7OeiV8MqPnGwdod2" target="_blank">
                    <div className="bg-slate-200 rounded-md p-3 mt-6 ring-1 ring-slate-300 cursor-pointer">
                        Whatsapp Group
                    </div>
                </Link>
                <div className="bg-slate-200 rounded-md p-3 mt-6 ring-1 ring-slate-300">
                    Contact Number - +91 63919-41192
                </div>
            </Box>
        </div>
    )
}