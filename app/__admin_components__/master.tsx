"use client"


import { ad_getUserInfo } from "@/(backend)/services/admin.service.serve"
import { formatDate } from "@/lib/helpers/formatDate"
import { Box, Button, Container, InputAdornment, InputLabel, Stack, TextField, Typography } from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { ToggleUSDTSection } from "./master_components/toggleUSDTSection"
import { EditUpiIdSection } from "./master_components/editUpiId"
import { ToggleGateway } from "./master_components/toggleGatewaySection"
import { QrUploadSection } from "./master_components/qrUploadSection"
import { ToggleWithdrawalType } from "./master_components/toggleWithdrawalTypeSection"
import { EditAvailableVideosSection } from "./master_components/editAvailableVideos"
import { PopupImageUploadSection } from "./master_components/popupImageUploadSection"
import { EditHomePageCarouselVideos } from "./master_components/homePageCarousel"

export const MasterPage: React.FC = () => {

    const [PhoneNumber, setPhoneNumber] = useState('');

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['admin', 'search_user'],
        mutationFn: () => ad_getUserInfo({ PhoneNumber })
    })

    return (
        <Container disableGutters sx={{ margin: '0 auto', py: 4, display: 'flex', justifyContent: 'center' }}>
            <Box width={'90%'}>
                <Box>
                    <InputLabel>
                        Phone Number
                    </InputLabel>
                    <TextField value={PhoneNumber} onChange={e => setPhoneNumber(e.target.value)} fullWidth size="small" variant="outlined" slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button disabled={isPending} onClick={() => mutate()} size="small" variant="contained">Submit</Button>
                                </InputAdornment>
                            )
                        }
                    }} />

                    {/* search result. */}
                    <Box py={2}>
                        {
                            isSuccess && data?.data && (
                                Object.entries(data.data).map(([key, value]) => (
                                    <div key={key} className="flex gap-x-3 p-1">
                                        <Typography sx={{ color: 'blueviolet' }}>{key} -&gt;</Typography>
                                        {
                                            key === 'createdAt' ? (
                                                <Typography>{formatDate(new Date(value as string), 'dd MMM yyyy hh : mm a')}</Typography>
                                            ) : (
                                                <Typography>{String(value)}</Typography>
                                            )
                                        }
                                    </div>
                                ))
                            )
                        }
                    </Box>
                </Box>

                {/* other links */}
                <Stack spacing={1} justifyContent={'center'} mt={4} direction={'row'} flexWrap={'wrap'} useFlexGap rowGap={1} >
                    <Button role="a" href="/nimda__/deposit-transaction" variant="outlined">Deposit</Button>
                    <Button role="a" href="/nimda__/withdrawal-transaction" variant="outlined">Withdrawal</Button>
                    <Button role="a" href="/nimda__/bank-edit" variant="outlined">Bank edit</Button>
                    <Button role="a" href="/nimda__/edit-password" variant="outlined">Id Password</Button>
                    <Button role="a" href="/nimda__/add-bonus" variant="outlined">Add Bonus</Button>
                    <Button role="a" href="/nimda__/block-account" variant="outlined">Block Account</Button>
                    <Button role="a" href="/nimda__/manual-withdrawal" variant="outlined">Manual Withdrawal</Button>
                    <Button role="a" href="/nimda__/today-withdrawals" variant="outlined">Today Withdrawal</Button>
                    <Button role="a" href="/nimda__/verify-reject-videos" variant="outlined">Verify Reject Videos</Button>
                    <Button role="a" href="/nimda__/add-or-remove-videos" variant="outlined">Add OR remove videos</Button>
                </Stack>


                {/* controller section */}
                <div className="mt-8">
                    <Typography fontWeight={600} fontSize={12} variant="overline" >Upload QR Code / UPI ID</Typography>

                    <div className="mt-8 flex w-full">
                        <div className="flex-[1] shadow-md p-4 ">
                            <QrUploadSection />
                            <ToggleGateway />
                        </div>
                        <EditUpiIdSection />
                    </div>
                    <div className="my-4">
                        <EditAvailableVideosSection />
                    </div>
                    <Box mt={3}>
                        <ToggleUSDTSection />
                        <ToggleWithdrawalType />
                    </Box>
                    <Box mt={3}>
                        <Typography variant="overline" fontWeight={600} sx={{ my: 2 }}>Popup Image upload section</Typography>
                        <PopupImageUploadSection />
                    </Box>
                    <Box mt={3}>
                        <Typography variant="overline" fontWeight={600} sx={{ my: 2 }}>Home Page Carousel section</Typography>
                        <EditHomePageCarouselVideos />
                    </Box>
                </div>

            </Box>
        </Container>
    )
}

