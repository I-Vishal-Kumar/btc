"use client"


import { useState } from "react";
import { Box, TextField, Button, Typography, CircularProgress, Container } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

export const ManualWithdrawal: React.FC = () => {
    const [loadingPayout, setPayout] = useState(false);
    const [formData, setFormData] = useState({
        AccNumber: "",
        Amount: "",
        Tax: "",
        IfscCode: "",
        AccHolderName: "",
        PhoneNumber: "",
        TransactionID: "",
        BankID: "1",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (!value) newErrors[key] = "This field is required";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAutoPayout = async () => {
        if (!validateForm()) return;

        setPayout(true);
        try {
            const res = await axios.post("/api/payment/AUTO_WITHDRAW", {
                payout: {
                    AccountNo: formData.AccNumber,
                    Amount: Number(formData.Amount) - (Number(formData.Amount) / 100) * Number(formData.Tax),
                    IFSC: formData.IfscCode.toUpperCase(),
                    BeneName: formData.AccHolderName,
                    BeneMobile: formData.PhoneNumber,
                    APIRequestID: formData.TransactionID,
                },
            });

            if (res.data.valid) {
                enqueueSnackbar(res.data.msg, { variant: "success" });
                setFormData({ AccNumber: "", Amount: "", Tax: "", IfscCode: "", AccHolderName: "", PhoneNumber: "", TransactionID: "", BankID: "1" });
            } else {
                enqueueSnackbar(res.data.msg, { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("An error occurred, please try again.", { variant: "error" });
            console.error(error);
        } finally {
            setPayout(false);
        }
    };

    return (
        <Container sx={{ display: 'grid', height: '100vh', placeContent: 'center' }}>
            <Box sx={{ maxWidth: 400, mx: "auto", p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
                <Typography variant="h6" mb={2} textAlign="center">
                    Manual Withdrawal
                </Typography>
                <TextField fullWidth label="Account Number" name="AccNumber" value={formData.AccNumber} onChange={handleChange} error={!!errors.AccNumber} helperText={errors.AccNumber} margin="dense" />
                <TextField fullWidth label="Amount" name="Amount" type="number" value={formData.Amount} onChange={handleChange} error={!!errors.Amount} helperText={errors.Amount} margin="dense" />
                <TextField fullWidth label="Tax (%)" name="Tax" type="number" value={formData.Tax} onChange={handleChange} error={!!errors.Tax} helperText={errors.Tax} margin="dense" />
                <TextField fullWidth label="IFSC Code" name="IfscCode" value={formData.IfscCode} onChange={handleChange} error={!!errors.IfscCode} helperText={errors.IfscCode} margin="dense" />
                <TextField fullWidth label="Account Holder Name" name="AccHolderName" value={formData.AccHolderName} onChange={handleChange} error={!!errors.AccHolderName} helperText={errors.AccHolderName} margin="dense" />
                <TextField fullWidth label="Phone Number" name="PhoneNumber" type="tel" value={formData.PhoneNumber} onChange={handleChange} error={!!errors.PhoneNumber} helperText={errors.PhoneNumber} margin="dense" />
                <TextField fullWidth label="Transaction ID" name="TransactionID" value={formData.TransactionID} onChange={handleChange} error={!!errors.TransactionID} helperText={errors.TransactionID} margin="dense" />

                <Button fullWidth variant="contained" color="primary" onClick={handleAutoPayout} disabled={loadingPayout} sx={{ mt: 2 }}>
                    {loadingPayout ? <CircularProgress size={24} /> : "Submit Withdrawal"}
                </Button>
            </Box>
        </Container>
    );
};
