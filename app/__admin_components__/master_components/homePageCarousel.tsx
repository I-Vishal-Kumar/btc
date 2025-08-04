import { ad_editAdminConfig } from "@/(backend)/services/admin.service.serve";
import { UploadFile } from "@/app/__components__/recharge/defaultGatewayPage";
import { ADMIN_CONTEXT } from "@/lib/hooks/admin.context";
import { Close, FileUpload } from "@mui/icons-material";
import { Box, Button, Typography, Stack, IconButton } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, useContext, useEffect } from "react";

export function EditHomePageCarouselVideos() {

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

    const handleAddImage = (url: string) => mutate({ key: "HomePageCarousel", newVal: [...(admin_config?.HomePageCarousel || []), url] })
    const handleRemoveImage = (upi: string) => mutate({ key: "HomePageCarousel", newVal: admin_config?.HomePageCarousel.filter(existing => existing !== upi) })

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) {
                enqueueSnackbar("Select a file first", { variant: 'error' });
                return;
            }

            const url = await UploadFile(file, `${ Date.now() }`);
            if (!url) {
                enqueueSnackbar("Failed to upload image", { variant: 'error' });
                return;
            }
            handleAddImage(url);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <Box flex={1} boxShadow={1} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }} p={1}>
            <Button variant="outlined" component="label">
                <FileUpload />
                <input onChange={_ => handleChange(_)} type="file" accept="image/*" hidden />
            </Button>
            <Typography>Upload image</Typography>

            <Box mt={3} textAlign={'start'} width={'100%'}>
                <Typography fontSize={12} fontWeight={500}>Uploaded images</Typography>
                <Stack spacing={1} mt={1} direction={'row'} >
                    {
                        (admin_config?.HomePageCarousel || []).map(upi_id => (
                            <div key={upi_id} className="relative rounded-md m-3 w-fit">
                                <Image
                                    height={100}
                                    width={200}
                                    className="aspect-auto w-[100] h-[100]"
                                    src={upi_id} alt="home page image" />
                                <IconButton sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    bgcolor: 'white'
                                }} disabled={isPending} onClick={() => handleRemoveImage(upi_id)}>
                                    <Close color="error" />
                                </IconButton>
                            </div>
                        ))
                    }
                </Stack>
            </Box>
        </Box>
    )
}
