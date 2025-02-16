"use client"

import { Box, Typography, Container, CardHeader } from '@mui/material';
import LineClamp from '@/lib/helpers/lineClamper';
import { TermDepositForm } from './termDepositForm';
import { QuickAccessSection } from './quickAccess';
import { USER_CONTEXT } from '@/lib/hooks/user.context';
import { useContext } from 'react';
import { RenderBalance } from '../_commonComponents/RenderBalance';


const TermDepositDashboard = () => {

    return (
        <Container sx={{ bgcolor: '#79dcfd', height: '100%' }} disableGutters maxWidth="md">
            <Box height={'50%'} position={'relative'}>

                <RenderUserDetails />

                <Box height={'50%'} width={'90%'} margin={'0 auto'} p={2} bgcolor={'red'} boxShadow={4} borderRadius={5}>
                    hello there
                </Box>

                <QuickAccessSection />

            </Box>

            <Box sx={{
                height: '50%',
                bgcolor: 'whitesmoke',
                p: 6,
                overflowY: 'auto', borderTopRightRadius: 40, borderTopLeftRadius: 40
            }}>
                <Typography variant='body2' fontWeight={600} >Create New Term Deposit</Typography>

                <TermDepositForm />

            </Box>
        </Container>
    )

};


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
