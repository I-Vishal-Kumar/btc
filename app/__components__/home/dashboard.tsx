"use client"

import { Box, Typography, Container, CardHeader, Stack } from '@mui/material';
import LineClamp from '@/lib/helpers/lineClamper';
import { TermDepositForm } from './termDepositForm';
import { QuickAccessSection } from './quickAccess';
import { USER_CONTEXT } from '@/lib/hooks/user.context';
import { memo, useContext } from 'react';
import { RenderBalance } from '../_commonComponents/RenderBalance';
import Image from 'next/image';


const MemoizedVideo = memo(Video);
const MemoizedUserDetails = memo(RenderUserDetails);
const MemoizedQuickAccess = memo(QuickAccessSection);

const TermDepositDashboard = () => {
    return (
        <Container sx={{ bgcolor: '#79dcfd', height: '100%' }} disableGutters maxWidth="md">
            <Box height={'50%'} position={'relative'}>
                <MemoizedUserDetails />
                <MemoizedVideo />
                <MemoizedQuickAccess />
            </Box>

            <Box sx={{
                height: '50%',
                bgcolor: 'whitesmoke',
                p: 6,
                borderTopRightRadius: 40,
                borderTopLeftRadius: 40
            }}>
                <Typography variant='body2' fontWeight={600}>Create New Term Deposit</Typography>
                <TermDepositForm />
            </Box>
            <Stack spacing={1}>
                <Image height={400} width={500}
                    alt='btc certificate' src={'/assets/certificate.jpg'} />
                <Image height={400} width={500}
                    alt='btc certificate' src={'/assets/newspaper_cutout.jpg'} />
                <Image height={400} width={500}
                    alt='btc certificate' src={'/assets/magazine.jpg'} />
                <Image height={400} width={500}
                    alt='btc certificate' src={'/assets/supporters.jpg'} />
            </Stack>
        </Container>
    );
};


function Video() {
    console.log("rendering")
    return (
        <Box height={'50%'} width={'90%'} position={'relative'} margin={'0 auto'} overflow={'hidden'} boxShadow={4} borderRadius={5}>
            <video controls loop style={{ position: 'absolute', top: 0, left: 0 }} height={'100%'} width={"100%"} muted src="/assets/home_video.mp4"></video>
        </Box>
    )
}

function RenderUserDetails() {

    const { userInfo } = useContext(USER_CONTEXT);

    return (
        <CardHeader
            sx={{ px: 4 }}
            title={
                <div className='flex gap-x-1'>
                    <Typography color='black' fontSize={17} fontFamily={"cursive"} fontWeight={600}>Welcome,</Typography>
                    <LineClamp maxLines={1}>
                        <Typography textTransform={'capitalize'} color='black' fontSize={17} fontFamily={"cursive"} fontWeight={600}>{userInfo.Name}</Typography>
                    </LineClamp>
                </div>
            }
            slotProps={{
                title: { maxWidth: '60%' }
            }}
            subheader={<Typography variant='caption' fontWeight={500}>+91 {userInfo.PhoneNumber}</Typography>}

            action={<RenderBalance />}
        />
    )
}

export default TermDepositDashboard;
