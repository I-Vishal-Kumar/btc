import LineClamp from "@/lib/helpers/lineClamper"
import { Typography, Box } from "@mui/material"
import { useRouter } from "next/navigation"
import { ReactNode, useContext, useEffect, useRef } from "react"
import { RenderInvitationLink } from "../_commonComponents/RenderInvitationLink"
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { DateTime } from "luxon"
import { enqueueSnackbar } from "notistack"
import { useMutation } from "@tanstack/react-query"
import { canWatch, claimGift } from "@/(backend)/services/user.service.serv"
import { Icon } from '@iconify/react';

const QuickAccess = ({ icon, isPending, label, onClick }: { isPending: boolean, icon: ReactNode, label: string, onClick?: VoidFunction }) => {
    return (
        <Box component={'button'} disabled={isPending} maxWidth={'100%'} overflow={'hidden'} p={0.2} {...(onClick ? { onClick } : {})} >
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

    const router = useRouter();
    const { setUserInfo, userInfo } = useContext(USER_CONTEXT);
    const pdfRef = useRef<HTMLAnchorElement>(null);
    const { data, isPending, isSuccess, mutate } = useMutation({
        mutationFn: claimGift
    })
    const {mutateAsync} = useMutation({
        mutationFn: canWatch ,
        mutationKey: ['available_videos']
    })
 
    const handleGiftClaim = async () => {

        // initially it will be null so if it exists then only check it.
        if (userInfo.LastSpinAt) {

            const canWatchResp = await mutateAsync();
            if(!canWatchResp.valid){
                enqueueSnackbar(canWatchResp.msg || 'Cannot watch now', {variant: 'error'});
                return;
            }
            const today = DateTime.now().startOf("day")
            const lastSpinDate = DateTime.fromJSDate(new Date(userInfo.LastSpinAt)).startOf('day')
            if (lastSpinDate.get("day") === today.get("day")) {
                enqueueSnackbar("You can spinn tomorrow", { variant: "warning" });
                return;
            }
        }
        mutate();
    }

    const quickLinks = [
        { label: "Recharge", icon: <Icon height={25} width={25} icon={'noto-v1:bank'} />, onClick: () => { router.push('/recharge') } },
        { label: "PDF", icon: <Icon height={25} width={25} icon={'icon-park:file-pdf'} />, onClick: () => { if (pdfRef?.current) pdfRef.current.click() } },
        { label: "Application", icon: <Icon height={25} width={25} icon={'devicon:androidstudio'} />, onClick: () => router.push('/download') },
        { label: "Gift", icon: <Icon height={25} width={25} icon={'noto:wrapped-gift'} />, onClick: () => handleGiftClaim() },
        { label: "Support", icon: <Icon height={25} width={25} icon={'streamline-plump-color:customer-support-7'} />, onClick: () => { router.push('/profile/support') } },
        { label: "Watch Video", icon: <Icon height={25} width={25} icon={'ep:video-play'} />, onClick: () => { router.push('/profile/watch_to_earn') } },
        { label: "Create Video", icon: <Icon height={25} width={25} icon={'fluent-color:video-32'} />, onClick: () => { router.push('/profile/upload_content') } },
    ]

    useEffect(() => {
        if (isSuccess && data.valid && data.data) {
            const gift = data.data.GIFT_AMOUNT;
            setUserInfo(prev => ({
                ...prev,
                Profit: prev.Profit + gift,
                Balance: prev.Balance + gift,
                LastSpinAt: DateTime.now().toISO()
            }))
            enqueueSnackbar(data.msg, { variant: 'success' })
        } else if (isSuccess) {
            enqueueSnackbar(data.msg || "something went wrong", { variant: "error" });
        }
    }, [isSuccess, isPending, data])

    return (

        <div className='p-2 my-4 bg-gray-400 bg-opacity-30 backdrop-blur-md shadow-sm shadow-gray-200 w-[80%] mx-auto rounded-2xl border border-white/20'>

            <Typography fontSize={11} fontWeight={600}>Quick Access</Typography>

            <Box display={'grid'} gridTemplateColumns={'repeat(4, 1fr)'} sx={{ placeContent: 'center' }} mt={1}>
                {quickLinks.map(details => <QuickAccess isPending={isPending} key={details.label} label={details.label} icon={details.icon} {...(details.onClick ? { onClick: details.onClick } : {})} />)}
            </Box>
            <a ref={pdfRef} hidden href="/assets/btcindia_pdf.pdf" download={'btcIndia'} />
            <RenderInvitationLink />
        </div>

    )
}