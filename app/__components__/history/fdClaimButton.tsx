"use client"

import { claimFD } from "@/(backend)/services/fd.services.serv"
import { FD_type } from "@/__types__/fd.types"
import { calculateFDProfit } from "@/lib/helpers/calcFdProfit"
import { USER_CONTEXT } from "@/lib/hooks/user.context"
import { Box, Button, CircularProgress } from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack"
import { useContext, useEffect } from "react"

export function ClaimButton({ _id, fd }: { _id: string, fd: FD_type }) {

    const { mutate, isSuccess, isPending, data } = useMutation({
        mutationFn: async () => claimFD({ _id }),
    })

    const { setUserInfo } = useContext(USER_CONTEXT);

    useEffect(() => {
        if (isSuccess && data.valid) {
            enqueueSnackbar(data.msg, { variant: 'success' });
            const profit = calculateFDProfit(fd.FdAmount, fd.FdDuration, fd.InterestRate);

            setUserInfo(prev => ({
                ...prev,
                Balance: prev.Balance + fd.FdAmount + profit,
                Profit: profit
            }))

        } else if (isSuccess) {
            enqueueSnackbar(data?.msg || 'something went wrong', { variant: 'error' });
        }
    }, [isPending, isSuccess, data])

    return (
        <Box width={'80%'} margin={"0 auto"} py={1} pb={2}>
            <Button onClick={() => mutate()} disabled={isPending} sx={{ bgcolor: '#98bbffe8', color: 'black', boxShadow: 0 }} fullWidth variant="contained">
                {isPending ? <CircularProgress size={"small"} /> : "claim"}
            </Button>
        </Box>
    )
}