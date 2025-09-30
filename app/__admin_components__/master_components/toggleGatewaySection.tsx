import { ad_editAdminConfig } from "@/(backend)/services/admin.service.serve";
import { GatewayTypes } from "@/__types__/db.types";
import { ADMIN_CONTEXT } from "@/lib/hooks/admin.context";
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect } from "react";

export function ToggleGateway() {

    const { admin_config, setConfig } = useContext(ADMIN_CONTEXT);

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationFn: ad_editAdminConfig,
        mutationKey: ['admin', 'usdt_toggle']
    });

    useEffect(() => {
        if (isSuccess && data?.valid && data.data) {

            enqueueSnackbar(data.msg, { variant: 'success' });
            setConfig(prev => ({ ...prev, [data.data?.key as string]: data.data?.newVal }));

        } else if (!isPending && isSuccess && !data?.valid) {
            enqueueSnackbar(data?.msg, { variant: 'error' });
        }

    }, [data, isPending]);

    return (
        <FormControl disabled={isPending} sx={{ mt: 2 }} >
            <FormLabel>Gateway</FormLabel>
            <RadioGroup
                onChange={(e) => mutate({ key: "Gateway", newVal: e.target.value })}
                value={admin_config?.Gateway}
            >
                <FormControlLabel label={GatewayTypes.AUTO_1} value={GatewayTypes.AUTO_1} control={<Radio />} />
                <FormControlLabel label={GatewayTypes.AUTO_2} value={GatewayTypes.AUTO_2} control={<Radio />} />
                {/* lg pay */}
                <FormControlLabel label={GatewayTypes.AUTO_3} value={GatewayTypes.AUTO_3} control={<Radio />} />
                <FormControlLabel label={GatewayTypes.RMS_1} value={GatewayTypes.RMS_1} control={<Radio />} />
                <FormControlLabel label={GatewayTypes.RMS_2} value={GatewayTypes.RMS_2} control={<Radio />} />
                <FormControlLabel label={GatewayTypes.DEFAULT} value={GatewayTypes.DEFAULT} control={<Radio />} />
            </RadioGroup>
        </FormControl>
    )
}
