import { Button, CircularProgress, Modal, TextField, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CustomInput } from "./customInput";
import { validateInput } from "@/lib/helpers/validateForm";
import { init_user_auth_mutation } from "@/sActions/userLoginSignupMutation";
import { useMutation } from "@tanstack/react-query";

/* ====================== SIGNUP FORM ====================== */
export const SignupForm = ({ setQueryParam }: { setQueryParam: (key: string, value: string) => void }) => {

    const searchParams = useSearchParams();
    const invitedBy = searchParams.get("invitedBy") || "";

    const [formData, setFormData] = useState({ phonenumber: "", password: "", name: "", parent: invitedBy });

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationFn: async () => {
            const formDataObj = new FormData();
            formDataObj.append("type", "signup");
            Object.entries(formData).forEach(([key, value]) => formDataObj.append(key, value));
            return await init_user_auth_mutation(null, formDataObj);
        },
    });

    const router = useRouter();

    return (
        <>
            <div className="flex gap-x-1 text-black mt-2">
                <Typography fontSize={18} fontWeight={500} onClick={() => setQueryParam("type", "login")} style={{ cursor: "pointer" }}>
                    Login
                </Typography>
                <Typography fontSize={12}>/</Typography>
                <Typography fontSize={18} fontWeight={700} onClick={() => setQueryParam("type", "signup")} style={{ cursor: "pointer" }}>
                    Signup
                </Typography>
            </div>

            {!data?.success && <Typography mt={2} color="red">{data?.msg}</Typography>}
            {data?.success && <Typography mt={2} color="green">{data?.msg}</Typography>}

            <motion.form onSubmit={(e) => {
                e.preventDefault();
                mutate();
            }}>

                <CustomInput label="Phone Number" name="phonenumber" inputMode="numeric"
                    isValid={validateInput('phonenumber', formData.phonenumber)}
                    value={formData.phonenumber} onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })} />

                <CustomInput label="Password" type="password" name="password"
                    isValid={validateInput('password', formData.password)}
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

                <CustomInput label="Full Name" name="name"
                    isValid={validateInput('name', formData.name)}
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

                <CustomInput label="Invitation Code" name="parent"
                    isValid={validateInput('parent', formData.parent)}
                    value={formData.parent} required={false} onChange={(e) => setFormData({ ...formData, parent: e.target.value })} />

                <Typography fontSize={12} color="black" fontWeight={500} onClick={() => window.open('https://t.me/BTC_CS_SUPPORT', "_blank")?.focus()} style={{ cursor: "pointer", marginTop: "1rem" }}>
                    Customer Support
                </Typography>

                <Button type="submit" fullWidth variant="contained" sx={{ mt: 5, bgcolor: "#78dafb", py: 2, fontSize: 14, textTransform: 'initial', color: "black", fontWeight: 700 }}>
                    {isPending ? <CircularProgress sx={{ color: 'black' }} size={'1rem'} /> : "Sign up"}
                </Button>
            </motion.form>

            <Modal hideBackdrop open={isSuccess && data.success}>
                <div className="h-full bg-black/10 w-full flex justify-center items-center">
                    <div className="p-6 rounded-2xl bg-[#c2c2c2] w-[80%]">
                        <Typography sx={{ px: 2, fontSize: 14, textAlign: 'center', color: 'rgba(0, 0, 0, 0.8)' }}>Take a screenshort or copy the ID & password to remember them easily.</Typography>
                        <div className="mt-6">
                            <TextField
                                fullWidth
                                size="small"
                                margin="dense"
                                label="Phone Number"
                                variant="filled"
                                focused
                                value={formData.phonenumber}
                                slotProps={{
                                    input: {
                                        readOnly: true
                                    }
                                }}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                size="small"
                                label="Password"
                                variant="filled"
                                focused
                                value={formData.password}
                                slotProps={{
                                    input: {
                                        readOnly: true
                                    }
                                }}
                                sx={{
                                    mt: 3,
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                    },
                                }}
                            />
                            <Button
                                onClick={() => router.push("/")}
                                fullWidth sx={{
                                    mt: 5, borderRadius: '100vw', textTransform: 'initial',
                                    background: 'linear-gradient(to right, #f3c45c,#e43905)'
                                }} variant="contained">
                                Okay
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};
