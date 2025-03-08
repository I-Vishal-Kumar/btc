"use client"


import { ad_addBonus } from "@/(backend)/services/admin.service.serve";
import { Box, Button, Container, TextField, Typography } from "@mui/material"
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

type BonusDetailsType = {
    PhoneNumber: string,
    Amount: number,
}

export const AddBonus: React.FC = () => {

    const [bonusDetails, setBonusData] = useState<BonusDetailsType>({
        PhoneNumber: '',
        Amount: 0
    });

    const handleChange = (field: keyof BonusDetailsType, value: string | number) => {
        setBonusData((prev) => ({ ...prev, [field]: value }));
    };

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['admin', 'give-bonus', bonusDetails.PhoneNumber],
        mutationFn: () => ad_addBonus(bonusDetails)
    })


    const handleSubmit = () => mutate()

    useEffect(() => {
        if (!isPending && isSuccess && data?.valid) {
            enqueueSnackbar(data.msg, { variant: 'success' });
            setBonusData({
                PhoneNumber: '',
                Amount: 0
            })
        } else if (!isPending && isSuccess && !data.valid) {
            enqueueSnackbar(data.msg || "something went wrong", { variant: 'error' });
        }
    }, [isPending, isSuccess, data]);

    return (
        <Container disableGutters sx={{ margin: '0 auto', py: 4, display: 'flex', justifyContent: 'center' }}>
            <Box width={'90%'}
                sx={{
                    display: 'grid',
                    gridTemplateRows: '1fr auto',
                    gap: 1
                }}
                boxShadow={1}
                borderRadius={1}
                p={1}
                mt={4}
            >
                <Typography>Add Bonus</Typography>

                <TextField
                    label="Phone Number"
                    value={bonusDetails.PhoneNumber}
                    onChange={(e) => handleChange('PhoneNumber', Number(e.target.value))}
                    size="small"
                    fullWidth
                />
                <TextField
                    label="Amount"
                    value={bonusDetails.Amount || ""}
                    onChange={(e) => handleChange('Amount', Number(e.target.value))}
                    size="small"
                    fullWidth
                />
                <div className="flex justify-between mt-4">
                    <Button disabled={isPending} size="small" variant="contained" color="success" onClick={handleSubmit}>
                        Submit
                    </Button>
                    <Button disabled={isPending} size="small" variant="contained" color="error" onClick={() => setBonusData({
                        PhoneNumber: '',
                        Amount: 0
                    })}>
                        Cancel
                    </Button>
                </div>
            </Box>
        </Container>
    )
}
