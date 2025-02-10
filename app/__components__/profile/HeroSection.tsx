"use client"
import LineClamp from "@/lib/helpers/lineClamper"
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { Avatar, Button, Typography } from "@mui/material"
import { useContext } from "react"
import { RenderBalance } from "../_commonComponents/RenderBalance"



export function HeroSection() {
    const { userInfo } = useContext(USER_CONTEXT)

    return (
        <div className="relative jc grid pt-10" >

            <div className="absolute top-5 left-0">
                <RenderBalance />
            </div>

            <div className="text-center grid justify-center">
                <Avatar sx={{ height: 100, justifySelf: 'center', width: 100, bgcolor: '#b9ebc3' }}>
                    A
                </Avatar>
                <LineClamp maxLines={1}>
                    <Typography maxWidth={200} mt={1} fontWeight={700} textTransform={'capitalize'} fontSize={15}>{userInfo.Name}</Typography>
                </LineClamp>

                <Typography variant="caption" fontSize={12} fontWeight={600} color="textDisabled" >+91 {userInfo.PhoneNumber}</Typography>

                <Button variant="contained" sx={{ boxShadow: 'none', display: 'block', mt: 2, textTransform: 'initial', bgcolor: '#73d1f0', borderRadius: '100vw' }} >Recharge</Button>
            </div>


        </div>
    )
}

