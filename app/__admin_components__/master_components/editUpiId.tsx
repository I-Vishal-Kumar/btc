import { ad_editAdminConfig } from "@/(backend)/services/admin.service.serve";
import { ADMIN_CONTEXT } from "@/lib/hooks/admin.context";
import { Close } from "@mui/icons-material";
import { TextField, Box, Button, Typography, Stack, InputAdornment, IconButton } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";

export function EditUpiIdSection() {

    const { admin_config, setConfig } = useContext(ADMIN_CONTEXT);
    const [upiId, setUpiId] = useState("");

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

    const handleAddUPI = () => mutate({ key: "UpiIds", newVal: [...(admin_config?.UpiIds || []), upiId] })
    const handleRemoveUPI = (upi: string) => mutate({ key: "UpiIds", newVal: admin_config?.UpiIds.filter(existing => existing !== upi) })

    return (
        <Box flex={1} boxShadow={1} p={1} maxWidth={'50%'}>
            <TextField
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                size="small"
                label="UPI ID"
                variant="outlined"
                sx={{ width: '100%' }}
            />
            <Button onClick={handleAddUPI} disabled={isPending} sx={{ mt: 1, }} fullWidth variant="contained" color="primary">
                Submit
            </Button>

            <Box mt={3}>
                <Typography fontSize={12} fontWeight={500}>Uploaded UPI ID's</Typography>
                <Stack spacing={1} mt={1} >
                    {
                        admin_config?.UpiIds.map(upi_id => (
                            <TextField
                                key={upi_id}
                                defaultValue={upi_id}
                                variant="outlined"
                                size="small"
                                disabled
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton disabled={isPending} onClick={() => handleRemoveUPI(upi_id)}>
                                                    <Close color="error" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        ))
                    }
                </Stack>
            </Box>
        </Box>
    )
}
