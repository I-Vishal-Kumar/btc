"use client"

import { Box, Typography, Container, CardHeader, Stack, Modal, Button, ClickAwayListener, IconButton } from '@mui/material';
import LineClamp from '@/lib/helpers/lineClamper';
import { TermDepositForm } from './termDepositForm';
import { QuickAccessSection } from './quickAccess';
import { USER_CONTEXT } from '@/lib/hooks/user.context';
import { memo, useContext, useState } from 'react';
import { RenderBalance } from '../_commonComponents/RenderBalance';
import Image from 'next/image';
import { Close } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { getAdminConfig } from '@/(backend)/services/admin.service.serve';
import { useQuery } from '@tanstack/react-query';

const MemoizedVideo = memo(Video);
const MemoizedUserDetails = memo(RenderUserDetails);
const MemoizedQuickAccess = memo(QuickAccessSection);

const TermDepositDashboard = ({ homePopupImage }: { homePopupImage?: string }) => {

    const [showModel, setModel] = useState(true);
    const { isPending, data, isSuccess } = useQuery({
        queryFn: getAdminConfig,
        queryKey: []
    })

    if (isPending || !isSuccess) return (
        <div className='grid place-content-center p-12'>
            Loading...
        </div>
    )

    return (
        <Container sx={{ background: 'url(/assets/home_bg2.jpg) 60% no-repeat', backgroundSize: 'cover', height: '150vh' }} disableGutters maxWidth="md">
            <Box position={'relative'} pb={'280px'}>
                <MemoizedUserDetails />
                <MemoizedVideo src={data.data?.HomePageImg || "/assets/home_crypto.jpg"} />
                <MemoizedQuickAccess />
            </Box>

            <Box sx={{
                bgcolor: 'whitesmoke',
                p: 4,
                pt: 10,
                position: 'relative',
                borderTopRightRadius: 40,
                borderTopLeftRadius: 40
            }}>
                <div className=' absolute -top-[280px] left-1/2 -translate-x-1/2 w-[350px] max-w-[80%] mx-auto'>
                    <HomeCarousel images={data.data?.HomePageCarousel || []} />
                    <div
                        className='absolute bottom-4 rounded-b-xl left-0 w-full'
                        style={{
                            padding: '10px',
                            marginTop: -25,
                            zIndex: 1,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: 'white',
                            background: 'linear-gradient(to right, #ffa500, #ff4500)',
                        }}
                    >
                        Events & Partners Feedback
                    </div>
                </div>
                <div className="p-[2px] flex justify-center items-center rounded-[1rem] bg-gradient-to-r from-red-500/80 to-orange-400/80">
                    <div className="bg-[#fef0e6] flex-1 p-8 rounded-[0.9rem]">
                        <Typography variant="body2" fontWeight={600}>
                            Create New Term Deposit
                        </Typography>
                        <TermDepositForm />
                    </div>
                </div>


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
            <Modal open={showModel} onClose={() => setModel(false)} >
                <div className='h-full w-full relative p-20 grid place-content-center'>
                    <ClickAwayListener onClickAway={() => setModel(false)}>
                        <div className="w-[90vw] p-4 flex flex-col rounded-md items-center max-w-md bg-white space-y-4">
                            {
                                homePopupImage ? (
                                    <Image
                                        src={homePopupImage}
                                        height={500}
                                        width={300}
                                        priority
                                        className='max-h-[60vh]'
                                        alt='test'
                                    />
                                ) : null
                            }
                            <Button
                                onClick={() => window.open("https://t.me/+IzSkZkmM6sMxYTJl")?.focus()}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(to right, #00B4DB, #00FF88)', // blue to green
                                    color: 'white',
                                    textTransform: 'none',
                                    borderRadius: '999px',
                                    py: 1.5,
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #00A3CC, #00E07B)',
                                    }
                                }}>
                                Telegram Group
                            </Button>

                            <Button
                                onClick={() => window.open("https://chat.whatsapp.com/CYNTuIVcGpwIZPK1wxb6ui?mode=ac_t")?.focus()}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(to right, #00C851, #FFEB3B)', // green to yellow
                                    color: 'white',
                                    textTransform: 'none',
                                    borderRadius: '999px',
                                    py: 1.5,
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #00B64A, #FFE600)',
                                    }
                                }}>
                                WhatsApp Group
                            </Button>

                            <div className='absolute top-4 right-2'>
                                <IconButton onClick={() => setModel(false)} sx={{ bgcolor: '#d6d6d6' }}>
                                    <Close sx={{ color: 'black' }} />
                                </IconButton>
                            </div>
                        </div>
                    </ClickAwayListener>

                </div>
            </Modal>
        </Container>
    );
};


function Video({ src }: { src: string }) {
    return (
        <Box
            position="relative"
            width="90%"
            margin="0 auto"
            overflow="hidden"
            borderRadius={5}
            boxShadow={4}
            sx={{
                aspectRatio: 1280 / 719
            }}
        >
            <Image
                src={src}
                alt="crypto coming soon"
                fill
                style={{
                    objectFit: 'cover',
                }}
            />
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


function HomeCarousel({ images }: { images: string[] }) {

    if (!images.length) return null;

    return (
        <Swiper
            modules={[Autoplay, EffectCoverflow]}
            effect="coverflow"
            loop={true}
            autoplay={{ reverseDirection: true }}
            spaceBetween={-100}
            slidesPerView={1.9}
            centeredSlides={true}
            coverflowEffect={{
                rotate: 0,
                depth: 300,
                modifier: 2,
                slideShadows: false,
            }}
            style={{ padding: "1rem" }}
        >
            {images.map((item, index) => (
                <SwiperSlide
                    key={index}>
                    <div
                        style={{
                            borderRadius: 20,
                            overflow: 'hidden',
                            backgroundColor: '#ddd',
                            height: 300,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            position: 'relative',
                        }}
                    >
                        <Image
                            src={item}
                            fill
                            alt='carousel image'
                        />
                    </div>
                </SwiperSlide>

            ))}
        </Swiper>
    )
}
export default TermDepositDashboard;
