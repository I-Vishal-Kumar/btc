import { BTC } from "@/(backend)/services/transaction.service.serve";
import { AdminConfigType } from "@/__types__/admin.types";
import { copyToClipboard } from "@/lib/helpers/copyText";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { USER_CONTEXT } from "@/lib/hooks/user.context";
import { ContentCopy, FileUpload } from "@mui/icons-material";
import { IconButton, Box, TextField, Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import axios from 'axios';
import { enqueueSnackbar } from "notistack";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export const UploadFile = async (file: File | null, PhoneNumber: string) => {
    if (!file) return;
    try {

        const res = await (await fetch(`/api/imageKitAuth?tmsmt=${ Date.now() }`)).json();

        if (!res.signature) return false;

        const formData = new FormData();
        formData.append('file', file);
        formData.append("publicKey", "public_vqtKMKdE65ozlbDD5YOmev2NHuQ=");
        formData.append("signature", res.signature);
        formData.append("expire", res.expire);
        formData.append("token", res.token);
        const sanitizedFileName = file.name
            .replace(/[^a-zA-Z0-9.]/g, "") // Remove special characters
            .replace(/(.*)\.(?=.*\.)/, "$1_") // Ensure only one dot for extension
            .slice(0, 8); // Limit filename to 8 characters
        formData.append("fileName", `${ PhoneNumber }_${ sanitizedFileName }`);

        const response = await axios.post(
            "https://upload.imagekit.io/api/v1/files/upload",
            formData,
            { headers: { "Content-Type": "multipart/form-data" }, }
        );

        return Boolean(response.data.url)
    } catch {
        return false;
    }
}


export const DefaultGateway: React.FC<{ amount: number, config: AdminConfigType }> = ({ amount, config }) => {
    const [utrNumber, setUtrNumber] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileURL, setFileURL] = useState<string>("");
    const [upiId, setUpiId] = useState<string>("");

    const { userInfo } = useContext(USER_CONTEXT)

    const router = useRouter();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length) {
            setFile(event.target.files[0]);
            if (fileURL) {
                URL.revokeObjectURL(fileURL);
            }
            setFileURL(URL.createObjectURL(event.target.files[0]));
        }
    };

    const { data, isSuccess, isPending, mutate } = useMutation({
        mutationFn: async () => {
            const isUploaded = await UploadFile(file, userInfo.PhoneNumber);
            if (!isUploaded) {
                enqueueSnackbar("File upload failed. Please try again.", { variant: "error" });
                return { msg: 'Failed to upload file this time', valid: false } // Prevents BTC function from running
            }
            return BTC(amount, utrNumber, config.Gateway)
        }
    })

    const handleSubmit = () => mutate()
    const handleCopy = () => copyToClipboard(upiId)


    useEffect(() => {
        setUpiId(config.UpiIds[Math.floor(Math.random() * config.UpiIds.length)] as string)
    }, [])

    useEffect(() => {
        if (isSuccess && data.valid) {

            enqueueSnackbar(data.msg, { variant: "success" });

            setTimeout(() => {
                router.back();
            }, 1000 * 2);

        } else if (isSuccess) {
            enqueueSnackbar(data.msg || "Something went wrong", { variant: "error" });
        }
    }, [isSuccess, isPending]);

    return (
        <Box className="absolute top-0 left-0 h-full w-full p-6 bg-white mx-auto">

            {/* QR Placeholder (Solid Black Box) */}
            <p className=" font-semibold mb-2 text-center">Scan QR Or Copy UPI ID To Pay</p>
            <Box height={200} width={200} position={'relative'} margin={"0 auto"}>
                <Image
                    fill
                    objectFit="contain"
                    priority
                    quality={50}
                    alt="payment url"
                    src={config.QrCode} />
            </Box>

            {/* UPI ID Copy Section */}
            <div className="flex items-center justify-center my-3 ">
                <p className="font-semibold text-black">Enter {upiId}</p>
                <IconButton onClick={handleCopy} sx={{ fontSize: 10, color: 'black' }}>
                    <ContentCopy fontSize="small" />{" "}
                    copy
                </IconButton>
            </div>

            {/* Amount Input */}
            <p>Enter Amount</p>
            <div className=" py-3 my-3 text-center ring-1 ring-slate-300 bg-slate-200 rounded-xl">
                <p>{formatNumber(amount)}</p>
            </div>

            {/* UTR Number Input */}
            <p className="mt-10" >Referance Number/UTR Number</p>
            <TextField
                variant="outlined"
                fullWidth
                size="small"
                sx={{
                    mt: 1,
                    "& input": {
                        textAlign: "center",
                    },
                    "& .MuiInputBase-input::placeholder": {
                        textAlign: "center",
                    },
                }}
                placeholder="Enter 12 Digit UTR Number"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                type="text"
            />

            {/* File Upload */}
            <p className="my-2 mt-4">Upload Payment Screenshot</p>
            <label className="bg-slate-200 ring-1 ring-slate-300 cursor-pointer border rounded-full flex w-fit items-center gap-x-2 justify-center px-4 py-2 mb-4">
                <p>Click here/Choose File</p>
                <FileUpload />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            {
                fileURL && (
                    <Image src={fileURL} alt="screenshort" height={200} width={100} />
                )
            }

            {/* Submit Button */}
            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, bgcolor: '#79dcfd', boxShadow: 0, borderRadius: '100vw' }}
                onClick={handleSubmit}
            >
                Submit
            </Button>
        </Box>
    );
}