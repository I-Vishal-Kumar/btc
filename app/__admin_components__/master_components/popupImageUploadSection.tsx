import { ad_editAdminConfig } from "@/(backend)/services/admin.service.serve";
import { UploadFile } from "@/app/__components__/recharge/defaultGatewayPage";
import { ADMIN_CONTEXT } from "@/lib/hooks/admin.context";
import { FileUpload } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, useContext, useEffect } from "react";

const MAX_FILE_SIZE = 0.5 * 1024 * 1024; // 500Kb in bytes



export function PopupImageUploadSection() {

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

    const handleChange = async (e: ChangeEvent<HTMLInputElement>, type: 'HomePageImg' | 'HomePopImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            enqueueSnackbar("File size too large. Maximum allowed is 1MB.", { variant: "error" });
            return;
        }
        const url = await UploadFile(file, `${ Date.now() }`);

        if (!url) {
            enqueueSnackbar('Failed to upload file', { variant: 'error' });
            return;
        }

        mutate({ key: type, newVal: url });

    };

    return (
        <div className="flex justify-evenly">
            <Box textAlign={'center'} >
                <Button variant="outlined" component="label">
                    <FileUpload />
                    <input onChange={_ => handleChange(_, 'HomePopImage')} type="file" accept="image/*" hidden />
                </Button>
                <Typography fontWeight={500}>Home Popup</Typography>
            </Box>
            <Box textAlign={'center'} >
                <Button variant="outlined" component="label">
                    <FileUpload />
                    <input onChange={_ => handleChange(_, 'HomePageImg')} type="file" accept="image/*" hidden />
                </Button>
                <Typography fontWeight={500}>Home Top Section</Typography>
            </Box>
        </div>
    )
}
