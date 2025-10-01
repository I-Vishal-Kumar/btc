import { ad_editAdminConfig } from "@/(backend)/services/admin.service.serve";
import { WithdrawalTypes } from "@/__types__/db.types";
import { ADMIN_CONTEXT } from "@/lib/hooks/admin.context";
import { Paper, Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect } from "react";

export function ToggleWithdrawalType() {

    const { admin_config, setConfig } = useContext(ADMIN_CONTEXT);

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationFn: ad_editAdminConfig,
        mutationKey: ['admin', 'withdraw_toggle']
    });

    useEffect(() => {
        if (isSuccess && data?.valid) {
            enqueueSnackbar(data.msg, { variant: 'success' });
            setConfig(prev => ({ ...prev, AutoWithdraw: data.data?.newVal as WithdrawalTypes }));

        } else if (!isPending && isSuccess && !data?.valid) {
            enqueueSnackbar(data?.msg, { variant: 'error' });
        }

    }, [data, isPending]);

    return (
        <Paper sx={{ textAlign: 'center', p: 1 }}>
            <Typography fontSize={12} fontWeight={500}>Withdrawal Type</Typography>
            <RadioGroup
                onChange={(e) => mutate({ key: "AutoWithdraw", newVal: e.target.value })}
                value={admin_config?.AutoWithdraw}
            >
                <FormControlLabel label={WithdrawalTypes.DEFAULT} value={WithdrawalTypes.DEFAULT} control={<Radio />} />
                <FormControlLabel label={WithdrawalTypes.LG_PAY} value={WithdrawalTypes.LG_PAY} control={<Radio />} />
                <FormControlLabel label={WithdrawalTypes.RMS} value={WithdrawalTypes.RMS} control={<Radio />} />
            </RadioGroup>
        </Paper>
    )
}