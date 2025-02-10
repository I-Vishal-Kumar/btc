import LineClamp from "@/lib/helpers/lineClamper"
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { Wallet } from "@mui/icons-material"
import { Typography, Box, TextField } from "@mui/material"
import { useRouter } from "next/navigation"
import { ReactNode, useContext } from "react"
import { MdContentCopy } from "react-icons/md"


const QuickAccess = ({ icon, label, onClick }: { icon: ReactNode, label: string, onClick?: VoidFunction }) => {
    return (
        <Box maxWidth={'100%'} overflow={'hidden'} p={0.2} {...(onClick ? { onClick } : {})} >
            <Box borderRadius={2} margin={'0 auto'} width={'fit-content'} p={0.8} bgcolor={'whitesmoke'}>
                {icon}
            </Box>
            <LineClamp maxLines={1}>
                <Typography textTransform={'capitalize'} maxWidth={'100%'} textAlign={'center'} mt={0.3} fontSize={9}>
                    {label}
                </Typography>
            </LineClamp>
        </Box>
    )
}

export const QuickAccessSection = () => {

    const { userInfo } = useContext(USER_CONTEXT);
    const router = useRouter();

    const quickLinks = [
        { label: "Recharge", icon: <Wallet />, onClick: () => { router.push('/profile/recharge') } },
        { label: "PDF", icon: <Wallet /> },
        { label: "Application", icon: <Wallet /> },
        { label: "Gift", icon: <Wallet /> },
        { label: "Support", icon: <Wallet />, onClick: () => { router.push('/profile/support') } },
    ]

    return (

        <div className='absolute p-2 bg-gray-400 bg-opacity-30 backdrop-blur-md shadow-sm shadow-gray-200  w-[80%] left-1/2 -translate-x-1/2 rounded-2xl -bottom-8 border border-white/20'>

            <Typography fontSize={11} fontWeight={600}>Quick Access</Typography>

            <Box display={'grid'} gridTemplateColumns={'repeat(5, 1fr)'} sx={{ placeContent: 'center' }} mt={1}>
                {quickLinks.map(details => <QuickAccess key={details.label} label={details.label} icon={details.icon} {...(details.onClick ? { onClick: details.onClick } : {})} />)}
            </Box>

            <Box display={'flex'} mt={1} bgcolor={'white'} borderRadius={1}>
                <Box>
                    <Typography fontSize={8}>
                        invite link
                    </Typography>
                </Box>
                <Box flex={1}>
                    <TextField
                        value={`${ window?.location.origin }/getting-started?type=signup&invitedBy=${ userInfo.InvitationCode }`}
                        fullWidth
                        size='small'
                        sx={{ pointerEvents: 'none', '& fieldset': { display: 'none' } }}
                        slotProps={{
                            input: {
                                style: { fontSize: 10 },
                                endAdornment: (
                                    <div className='bg-white pl-3'>
                                        <MdContentCopy fontSize={15} />
                                    </div>
                                )
                            }
                        }}
                    />
                </Box>
            </Box>
        </div>

    )
}