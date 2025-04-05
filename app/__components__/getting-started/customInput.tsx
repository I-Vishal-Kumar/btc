import { Done, Close } from "@mui/icons-material"
import { TextFieldProps, TextField, IconButton } from "@mui/material"
import { motion } from "framer-motion"
import { ChangeEvent } from "react"

type CustomInputType = {
    label: string
    type?: string
    name: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    isValid: boolean | null
}

// ✅ Custom Input Component with End Adornment (Tick/Cross)
export function CustomInput({ label, name, type = "text", value, onChange, isValid, ...props }: CustomInputType & TextFieldProps) {
    return (
        <motion.div className="mt-5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.03 }}
        >
            <TextField
                required
                {...props}
                fullWidth
                label={label}
                name={name}
                type={type}
                value={value}
                variant="filled"
                onChange={onChange}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                slotProps={
                    {
                        input: {
                            endAdornment: (
                                <>
                                    {isValid === true && <IconButton color="success"><Done /></IconButton>}
                                    {isValid === false && <IconButton color="error"><Close /></IconButton>}
                                </>
                            ),
                        }
                    }
                }

            />
        </motion.div>
    );
}