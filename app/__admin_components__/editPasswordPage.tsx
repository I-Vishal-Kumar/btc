"use client"


import { ad_editPassword, ad_getUserPassInfo } from "@/(backend)/services/admin.service.serve";
import { UserType } from "@/__types__/user.types";
import { Box, Button, CircularProgress, Container, InputAdornment, InputLabel, TextField, Typography } from "@mui/material"
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

export const EditPassword: React.FC = () => {

    const [PhoneNumber, setPhoneNumber] = useState('');
    const [isVerified, setVerified] = useState(false);

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['admin', 'search_transaction', PhoneNumber],
        mutationFn: () => ad_getUserPassInfo({ PhoneNumber })
    })

    useEffect(() => {
        if (!isVerified) {
            const input = window.prompt("Enter admin password :");
            if (input === '1234568rv') {
                setVerified(true);
            }
        }
    }, [isVerified])
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
                                        <RenderUserInfo index={`${ 1 }`} details={data.data} />
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

function RenderUserInfo({ index, details }: { index: string, details: UserType }) {

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(details);

    const handleChange = (field: keyof UserType, value: string | number) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    };

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationKey: ['editPassowrd', details._id],
        mutationFn: ad_editPassword
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

                {/* Name */}
                <TextField
                    label="Name"
                    value={editedData.Name}
                    onChange={(e) => handleChange('Name', Number(e.target.value))}
                    size="small"
                    fullWidth
                    disabled={!isEditing}
                />

                {/* Password */}
                <TextField
                    label="Password"
                    value={editedData.Password}
                    onChange={(e) => handleChange('Password', Number(e.target.value))}
                    size="small"
                    fullWidth
                    disabled={!isEditing}
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