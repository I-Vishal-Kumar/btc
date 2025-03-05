import { ad_editAdminConfig } from "@/(backend)/services/admin.service.serve";
import { GatewayTypes } from "@/__types__/db.types";
import { ADMIN_CONTEXT } from "@/lib/hooks/admin.context";
import { Paper, Typography, RadioGroup, Button, FormControlLabel, Radio } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect } from "react";

export function ToggleUSDTSection({ }) {

    const { admin_config, setConfig } = useContext(ADMIN_CONTEXT);

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationFn: ad_editAdminConfig,
        mutationKey: ['admin', 'usdt_toggle']
    });

    useEffect(() => {
        if (isSuccess && data?.valid) {
            enqueueSnackbar(data.msg, { variant: 'success' });
            setConfig(prev => ({ ...prev, Usdt: !prev.Usdt }));

        } else if (!isPending && isSuccess && !data?.valid) {
            enqueueSnackbar(data?.msg, { variant: 'error' });
        }

    }, [data, isPending]);

    return (
        <Paper sx={{ textAlign: 'center', p: 1 }}>
            <Typography fontSize={12} fontWeight={500}>USDT Channel</Typography>
            <RadioGroup
                row
                sx={{ mt: 2, textAlign: 'center', justifyContent: 'center', columnGap: 2 }}
                defaultValue={GatewayTypes.DEFAULT}
            >
                <Button onClick={() => mutate({ key: 'Usdt', newVal: true })} disabled={isPending} sx={{ width: '40%' }} size="small" variant="outlined" >
                    <FormControlLabel label={'Show'} checked={!!admin_config?.Usdt} control={<Radio />} />
                </Button>
                <Button onClick={() => mutate({ key: 'Usdt', newVal: false })} disabled={isPending} sx={{ width: '40%' }} size="small" variant="outlined" >
                    <FormControlLabel label={'hide'} checked={!admin_config?.Usdt} control={<Radio />} />
                </Button>
            </RadioGroup>
        </Paper>
    )
}