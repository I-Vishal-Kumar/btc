"use client"

import { _walletOperation } from "@/(backend)/services/user.wallet.serv";
import { WithdrawalOperationIdentifier, WithdrawalOperationIdentifierType } from "@/__types__/ui_types/profil.types";
import { UserWallet } from "@/__types__/user.types";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { USER_CONTEXT } from "@/lib/hooks/user.context";
import { WALLET_CONTEXT } from "@/lib/hooks/userWallet.context";
import { Box, Button, CircularProgress, MenuItem, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useRef, useState } from "react";

type fields = Record<string, string>


// different forms for withdrawal funds page.

export const Section: React.FC<{
    title: string, _identifier: WithdrawalOperationIdentifierType,
    fields: fields[]
}> = ({ title, _identifier, fields }) => {

    const formRef = useRef<HTMLFormElement>(null);
    const { wallet } = useContext(WALLET_CONTEXT);
    const { userInfo } = useContext(USER_CONTEXT);
    const [showFull, setShowFull] = useState(!([WithdrawalOperationIdentifier.LOCAL_BANK_PASS_RESET, WithdrawalOperationIdentifier.USDT_BANK_PASS_RESET] as string[]).includes(_identifier));
    const { data, isPending, isSuccess, mutate } = useMutation({
        mutationFn: _walletOperation,
    })

    const options = [600, 1000, 1_500, 3_000, 5_000, 10_000, 20_000, 50_000];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const data: Record<string, string> = {};

        fields.forEach((field) => {
            const value = formData.get(field.formFieldName);
            if (value) data[field.formFieldName] = value.toString();
        });

        if (_identifier === WithdrawalOperationIdentifier.LOCAL_BANK_TRANSFER) {

            const taxPercent = userInfo.HoldingScore > 600 ? 15 : 20
            const tax = Math.ceil((taxPercent / 100) * Number(data.Amount));
            const totalAmount = Number(data.Amount) + tax;
            const procede = window.confirm(`
                    ${ totalAmount } will be deducted from your account
                    Base Amount - ${ data.Amount }
                    Tax Amount - ${ tax }
                    `);
            if (!procede) return;
        }

        mutate({ data, _identifier });

    };

    useEffect(() => {
        if (isSuccess && data.valid) {
            formRef.current?.reset();
            enqueueSnackbar(data.msg ?? 'Withdrawal operation was successful', { variant: 'success' });
        } else if (isSuccess) {
            enqueueSnackbar(data.msg ?? 'Something went wrong', { variant: 'error' })
        }
    }, [data, isSuccess, isPending])

    if (!showFull) {
        return (
            <div className="flex mt-4 justify-center">
                <Button
                    onClick={() => setShowFull(prev => !prev)}
                    size="small"
                    variant="outlined"
                >Forgot password</Button>
            </div>
        )
    }
    return (
        <Box component={'form'} ref={formRef} onSubmit={handleSubmit} >
            <Typography fontWeight={600} mt={2}>{title}</Typography>
            {fields.map((field) => (
                (_identifier === WithdrawalOperationIdentifier.LOCAL_BANK_TRANSFER)
                    && (field.formFieldName === 'Amount')
                    ? (
                        <TextField
                            key={field.formFieldName}
                            select
                            label="Amount"
                            name="Amount" // required for form data submission
                            defaultValue={options[0]} // default selection (e.g., 100)
                            fullWidth
                            margin="dense"
                            size="small"
                        >
                            {options.map((val) => (
                                <MenuItem key={val} value={val}>
                                    ₹ {formatNumber(val, { compact: false, })}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <TextField defaultValue={wallet[field.formFieldName as keyof UserWallet]} required name={field.formFieldName} key={field.formFieldName} size="small" variant="outlined" placeholder={field.placeholder} fullWidth type={field.type || "text"} sx={{ mt: 1, bgcolor: '#ebebeb' }} />

                    )
            ))}
            <Button
                variant="contained"
                fullWidth
                type="submit"
                size="small"
                disabled={isPending}
                sx={{
                    bgcolor: "#89CEFF",
                    color: "white",
                    boxShadow: 'none',
                    fontSize: "16px",
                    textTransform: "none",
                    borderRadius: "24px",
                    mt: 1,
                    "&:hover": { bgcolor: "#6db9e8" },
                }}
            >
                {isPending ? <CircularProgress size={25} /> : "Submit"}
            </Button>
        </Box>
    )

};
