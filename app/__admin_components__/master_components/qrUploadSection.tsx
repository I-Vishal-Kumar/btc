import { ad_editAdminConfig } from "@/(backend)/services/admin.service.serve";
import { ADMIN_CONTEXT } from "@/lib/hooks/admin.context";
import { FileUpload } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, useContext, useEffect } from "react";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes



export function QrUploadSection() {

    const { setConfig } = useContext(ADMIN_CONTEXT);

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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            enqueueSnackbar("File size too large. Maximum allowed is 1MB.", { variant: "error" });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                mutate({ key: "QrCode", newVal: reader.result });
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <Box textAlign={'center'} >
            <Button variant="outlined" component="label">
                <FileUpload />
                <input onChange={handleChange} type="file" accept="image/*" hidden />
            </Button>
            <Typography fontWeight={500}>Upload QRCode</Typography>
        </Box>
    )
}
