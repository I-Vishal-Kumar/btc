"use client"

import { getAdminConfig } from "@/(backend)/services/admin.service.serve"
import { claimFD } from "@/(backend)/services/fd.services.serv"
import { FdStatus } from "@/__types__/db.types"
import { FD_type } from "@/__types__/fd.types"
import { calculateFDProfit } from "@/lib/helpers/calcFdProfit"
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { Box, Button, CircularProgress, Modal, Typography } from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack"
import { useContext, useEffect, useRef, useState } from "react"

// Stages mapped to countdown values
const loadingStages: Record<number, string> = {
    110: "🔍 Preparing resources...",
    90: "⛏️ Loading tools...",
    70: "⚙️ Configuring system...",
    50: "⚡ Boosting efficiency...",
    30: "⚒️ Trading in progress...",
    15: "💰 Finalizing rewards...",
    5: "🚀 Wrapping up...",
};

export function ClaimButton({ _id, fd }: { _id: string; fd: FD_type }) {
    const { mutate, isSuccess, isPending, data } = useMutation({
        mutationFn: async () => claimFD({ _id }),
    })
    const { data: adminConfig, isPending: isLoadingAdminData } = useQuery({
        queryFn: getAdminConfig,
        queryKey: ['admin_config']
    })

    const { setUserInfo } = useContext(USER_CONTEXT);

    // Countdown state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [countdown, setCountdown] = useState(120); // 2 minutes
    const [loadingStage, setLoadingStage] = useState("🪄 Starting...");
    // const [isWaitingDelay, setIsWaitingDelay] = useState(false);
    const mutationRef = useRef(false);
    const hasClaimedRef = useRef(false);

    const handleClaimStart = () => {
        // setIsWaitingDelay(true);

        mutationRef.current = false;
        hasClaimedRef.current = false;
        setIsModalOpen(true);
        setCountdown(120);
        setLoadingStage("Claim process started");
        // setIsWaitingDelay(false);
    }
    // Handle countdown and stage updates
    useEffect(() => {
        if (isModalOpen && !mutationRef.current) {
            mutationRef.current = true;
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
                if (loadingStages[countdown]) setLoadingStage(loadingStages[countdown]);
            }, 1000);

            return () => {
                mutationRef.current = false;
                clearInterval(timer)
            };
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (countdown === 0 && !isPending && !hasClaimedRef.current) {
            hasClaimedRef.current = true;
            // alert('call')
            mutate();
            setIsModalOpen(false);
        }
    }, [countdown, isPending])

    // Handle successful claim
    useEffect(() => {
        if (isSuccess && data.valid) {
            enqueueSnackbar(data.msg, { variant: "success" });
            const profit = calculateFDProfit(fd.FdAmount, fd.FdDuration, fd.InterestRate);

            setUserInfo((prev) => ({
                ...prev,
                Balance: prev.Balance + profit / fd.FdDuration,
                Profit: profit / fd.FdDuration,
                HoldingScore: prev.HoldingScore + 10,
            }));
        } else if (isSuccess) {
            enqueueSnackbar(data?.msg || "Something went wrong", { variant: "error" });
        }
    }, [isSuccess, data]);

    if (isSuccess && !isPending || isLoadingAdminData) return null;

    if (new Date().getDay() === 0 && fd.FdStatus !== FdStatus.HALTED) {
        return (
            <div className="flex justify-center border-2 border-solid border-green-500">
                <Typography variant="overline">You can claim tomorrow</Typography>
            </div>
        )
    }
    const randomIndex = Math.floor(Math.random() * (adminConfig?.data?.AvailableVideos?.length || 0));
    const randomVideo = adminConfig?.data?.AvailableVideos?.[randomIndex];

    return (
        <Box width={"90%"} maxWidth={420} margin="0 auto" py={1} pb={2}>
            <Button
                onClick={handleClaimStart}
                disabled={isPending}
                sx={{
                    bgcolor: "#98bbffe8",
                    color: "black",
                    boxShadow: 0,
                    fontWeight: 600,
                    ":disabled": {
                        bgcolor: "#98bbffe8",
                        color: "black",
                    }
                }}
                fullWidth
                variant="contained"
            >
                {isPending ? <CircularProgress size={"small"} /> : "Claim"}
            </Button>

            <Modal open={isModalOpen} onClose={() => { }}>
                <div className="bg-white h-full w-full flex flex-col justify-center items-center px-4">
                    {/* Logo placeholder */}
                    <Box position={'relative'} zIndex={0} display={'flex'} justifyContent={'center'} width={'100%'} height={'fit-content'}>
                        <Box width={100} height={60} sx={{ background: 'url(/getting-started/logo_full.png) center no-repeat', backgroundSize: 'contain' }} borderRadius={2} />
                        <div className="absolute 
                            rounded-full top-[50%] left-[50%] translate-x-[-50%]
                            h-[1rem] w-[1rem] bg-red-500/70 z-[-1] backdrop:blur-2xl blur-sm
                            shadow-[0_0_200px_100px_rgba(239,68,68,1)]
                            ">
                        </div>
                    </Box>

                    <Typography mt={2} zIndex={0} fontWeight={600} fontSize={16} textAlign="center">
                        BT Construction – Bharat ka apna trusted earning platform!
                    </Typography>

                    {/* Promo banner placeholder */}
                    <Box
                        mt={3}
                        width="100%"
                        height={190}
                        overflow="hidden"
                        bgcolor="#f0f0f0"
                        position="relative"
                    >
                        {
                            randomVideo ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    className="rounded-md pointer-events-none" // Prevents interaction
                                    src={`${ randomVideo }?autoplay=1&mute=1`}
                                    title="Moments on necxis"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media;"
                                    allowFullScreen
                                ></iframe>
                            ) : null
                        }

                        {/* Custom overlay to only allow click in corner for mute */}
                        <Box
                            position="absolute"
                            bottom={0}
                            right={0}
                            width={'100%'}
                            height={'100%'}
                            zIndex={10}
                        // This part would require a custom mute toggle
                        // YouTube embeds do not expose native mute buttons
                        ></Box>
                    </Box>


                    {/* Countdown Section */}
                    <Box
                        mt={4}
                        width="100%"
                        textAlign="center"
                        py={3}
                        borderRadius={4}
                        zIndex={1}
                        position={'relative'}
                    >
                        <Typography fontSize={20} fontWeight="bold">
                            {loadingStage}
                        </Typography>
                        <Typography fontSize={48} fontWeight="bold" mt={2}>
                            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                        </Typography>
                        <Typography fontSize={16} mt={2} fontWeight="bold" color="gray">
                            Interest Will Be Credited Shortly!
                        </Typography>
                        <Typography fontSize={14} mt={2} px={4} color="gray">
                            Please wait while we process your claim<br />
                            do not close the App or Refresh
                        </Typography>
                        <div className="absolute 
                            rounded-full top-0 left-[50%] translate-x-[-50%]
                            h-[10rem] w-[10rem] bg-sky-400/50 z-[-1] backdrop:blur-2xl blur-sm
                            shadow-[0_0_200px_100px_rgba(56,189,248,0.6)]
                            ">
                        </div>
                    </Box>
                </div>
            </Modal>
        </Box>
    );
}