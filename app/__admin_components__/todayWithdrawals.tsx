import { ad_getTodayWithdrawals } from "@/(backend)/services/admin.service.serve";
import { Box, Button, Container, Typography } from "@mui/material"

export const TodayWithdrawals: React.FC = async () => {

    const data = await ad_getTodayWithdrawals()

    if (!data) return <h1>No data available</h1>

    return (
        <Container disableGutters sx={{ margin: '0 auto', py: 4, pt: 0, display: 'flex', justifyContent: 'center' }}>
            <Box width={'90%'}>
                <Typography py={2} fontWeight={800} textAlign={'center'}>Today Withdrawals</Typography>
                <div className="flex justify-between items-center">
                    <Typography>
                        Phone Number
                    </Typography>
                    <Typography>
                        Password
                    </Typography>
                    <Typography>
                        Login link
                    </Typography>
                </div>
                {/* search result. */}
                <Box py={2} border={1} p={1} mt={2} borderRadius={2}>
                    {
                        data?.data && (
                            (data.data || []).map((details, i) => (
                                <div key={details.PhoneNumber} className="grid grid-cols-[0fr_1fr] items-center">
                                    <Typography className="pr-1 text-red-500 font-bold">{i + 1}.</Typography>
                                    <div className="flex py-2 col-span-1 border-b-2 justify-between items-center">
                                        <Typography>
                                            {details.PhoneNumber}
                                        </Typography>
                                        <Typography>
                                            {details.Password}
                                        </Typography>
                                        <Button variant="outlined" LinkComponent={"a"}
                                            target="_blank" href={`https://btcindia.bond/getting-started?type=login&id=${ details.PhoneNumber }&pass=${ details.Password }`}
                                        >
                                            Login
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )
                    }
                </Box>

            </Box>
        </Container>
    )
}
