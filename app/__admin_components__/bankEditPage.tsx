"use client"


import { ad_editUserWallet, ad_getUserWallet } from "@/(backend)/services/admin.service.serve";
import { UserWallet } from "@/__types__/user.types";
import { Box, Button, CircularProgress, Container, InputAdornment, InputLabel, TextField, Typography } from "@mui/material"
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

export const BankEdit: React.FC = () => {

    const [PhoneNumber, setPhoneNumber] = useState('');

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['admin', 'search_transaction', PhoneNumber],
        mutationFn: () => ad_getUserWallet({ PhoneNumber })
    })

    return (
        <Container disableGutters sx={{ margin: '0 auto', py: 4, display: 'flex', justifyContent: 'center' }}>
            <Box width={'90%'}>

                <InputLabel>Phone Number</InputLabel>

                <TextField value={PhoneNumber} onChange={e => setPhoneNumber(e.target.value)} fullWidth size="small" variant="outlined" slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <Button disabled={isPending} onClick={() => mutate()} size="small" variant="contained">Submit</Button>
                            </InputAdornment>
                        )
                    }
                }} />

                {/* search result. */}
                <Box py={2} border={1} p={1} mt={2} borderRadius={2}>
                    {
                        isPending && (
                            <div className="flex justify-center items-center py-4">
                                <CircularProgress />
                            </div>
                        )
                    }
                    {
                        isSuccess && data?.data && (
                            <>
                                <Typography fontWeight={600}>Search result</Typography>
                                {
                                    data.data && (
                                        <RenderWallet index={`${ 1 }`} details={data.data} />
                                    )
                                }
                            </>
                        )
                    }
                </Box>

            </Box>
        </Container>
    )
}

function RenderWallet({ index, details }: { index: string, details: UserWallet }) {

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(details);

    const handleChange = (field: keyof UserWallet, value: string | number) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    };

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['editbank', details._id],
        mutationFn: ad_editUserWallet
    })

    const handleSubmit = () => {
        setIsEditing(false);
        mutate(editedData)
    }

    useEffect(() => {
        if (!isPending && isSuccess && data?.valid) {
            enqueueSnackbar(data.msg, { variant: 'success' });
        } else if (!isPending && isSuccess && !data?.valid) {
            enqueueSnackbar(data.msg || 'something went wrong', { variant: 'error' });
        }
    }, [isSuccess, isPending])

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '0.1fr 1fr',
                gridTemplateRows: '1fr auto',
                gap: 1
            }}
            boxShadow={1}
            borderRadius={1}
            p={1}
            mt={4}
        >
            {/* Index */}
            <Typography fontWeight={700}>{index}</Typography>

            <Box px={1} display="grid" gap={1}>

                {/* Phone Number */}
                <TextField
                    label="Phone Number"
                    value={details.PhoneNumber}
                    size="small"
                    disabled
                    fullWidth
                />

                {/* AccHolderName */}
                <TextField
                    label="AccHolderName"
                    value={editedData.AccHolderName}
                    onChange={(e) => handleChange('AccHolderName', Number(e.target.value))}
                    size="small"
                    fullWidth
                    disabled={!isEditing || !editedData.AccHolderName}
                />

                {/* AccNumber */}
                <TextField
                    label="AccNumber"
                    value={editedData?.AccNumber}
                    onChange={(e) => handleChange('AccNumber', Number(e.target.value))}
                    size="small"
                    fullWidth
                    disabled={!isEditing || !editedData.AccNumber}
                />

                {/* BankName */}
                <TextField
                    label="BankName"
                    value={editedData.BankName}
                    onChange={(e) => handleChange('BankName', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!isEditing || !editedData.BankName}
                />

                {/* Branch */}
                <TextField
                    label="Branch"
                    value={editedData.Branch}
                    onChange={(e) => handleChange('Branch', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!isEditing || !editedData.Branch}
                />

                {/* IfscCode */}
                <TextField
                    label="IfscCode"
                    value={editedData.IfscCode}
                    onChange={(e) => handleChange('IfscCode', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!isEditing || !editedData.IfscCode}
                />

                {/* UsdtAddress */}
                <TextField
                    label="UsdtAddress"
                    value={editedData.UsdtAddress}
                    onChange={(e) => handleChange('UsdtAddress', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!isEditing || !editedData.UsdtAddress}
                />

                {/* AppName */}
                <TextField
                    label="AppName"
                    value={editedData.AppName}
                    onChange={(e) => handleChange('AppName', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!isEditing || !editedData.AppName}
                />


            </Box>

            {/* Buttons */}
            <Box
                display="flex"
                justifyContent="space-evenly"
                alignItems="flex-end"
                pt={1}
                sx={{ gridColumn: 'span 2' }}
            >
                {isEditing ? (
                    <>
                        <Button disabled={isPending} size="small" variant="contained" color="success" onClick={handleSubmit}>
                            Submit
                        </Button>
                        <Button disabled={isPending} size="small" variant="contained" color="error" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button disabled={isPending} size="small" variant="contained" onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
}