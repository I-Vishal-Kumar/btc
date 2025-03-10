"use client"

import { claimFD } from "@/(backend)/services/fd.services.serv"
import { FD_type } from "@/__types__/fd.types"
import { calculateFDProfit } from "@/lib/helpers/calcFdProfit"
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { Box, Button, CircularProgress, Modal, Typography } from "@mui/material"
import { useMutation } from "@tanstack/react-query"
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

    const { setUserInfo } = useContext(USER_CONTEXT);

    // Countdown state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [countdown, setCountdown] = useState(120); // 2 minutes
    const [loadingStage, setLoadingStage] = useState("🪄 Starting...");
    const mutationRef = useRef(false);

    // Handle countdown and stage updates
    useEffect(() => {
        if (isModalOpen && countdown > 0 && !mutationRef.current) {
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
    }, [isModalOpen, countdown]);

    useEffect(() => {
        if (countdown === 0 && !isPending) {
            mutate();
            setIsModalOpen(false);
        }
    }, [countdown])

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

    return (
        <Box width={"80%"} margin={"0 auto"} py={1} pb={2}>
            <Button
                onClick={() => {
                    setIsModalOpen(true);
                    setCountdown(120);
                    setLoadingStage("🪄 Starting...");
                }}
                disabled={isPending}
                sx={{ bgcolor: "#98bbffe8", color: "black", boxShadow: 0 }}
                fullWidth
                variant="contained"
            >
                {isPending ? <CircularProgress size={"small"} /> : "Claim"}
            </Button>
            <Modal open={isModalOpen} onClose={() => { }}>
                <div className="bg-slate-50 h-full w-full flex flex-col justify-center items-center">
                    <Typography fontSize={19} fontWeight="bold">{loadingStage}</Typography>
                    <Typography variant="h4" fontWeight="bold" mt={2}>
                        {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                    </Typography>
                    <Typography fontSize={12} textAlign={'center'} color="error" mt={4} fontWeight="bold">
                        Please do not close or refresh the page while mining is in progress.
                    </Typography>
                </div>
            </Modal>
        </Box>
    );
}
