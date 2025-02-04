import { formatNumber } from "@/lib/helpers/numberFormatter";
import { Box, Button, Slider, TextField, Typography } from "@mui/material";
import { useState, ChangeEvent } from "react";
import { MdOutlineCurrencyRupee } from "react-icons/md";

export const TermDepositForm = () => {

    const [value, setValue] = useState<number[]>([200, 0]); // Minimum value is fixed at 200
    const min = 200;
    const max = 12000;

    const handleSliderChange = (_: Event, newValue: number | number[]) => {
        if (typeof newValue !== "object") return;
        setValue(newValue);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = [min, Number(event.target.value)];
        if (newValue[1] <= max) {
            setValue(newValue);
        }
    };

    return (
        <>
            <TextField
                label="Amount"
                slotProps={{
                    input: {
                        startAdornment: value[1] ? <MdOutlineCurrencyRupee /> : null
                    }
                }}
                value={value[1] ? value[1] : ""}
                onChange={handleInputChange}
                sx={{
                    mt: 2,
                    "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                            borderColor: "#808080", // Change border color when focused
                        },
                    },
                    "& .MuiInputLabel-root": {
                        color: "gray", // Default label color
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "gray", // Label color when focused
                    },
                }}
                size='small'
                fullWidth
                placeholder='Amount'
            />
            <RangeSlider min={min} max={max} value={value[1] < min ? 200 : value[1]} handleSliderChange={handleSliderChange} />

            <Typography variant="caption" color="textDisabled">Period</Typography>

            <div className="ring-1 ring-gray-300 rounded-md p-1 bg-slate-200">
                <Typography textAlign={'center'} fontSize={14}>2 Years@5%</Typography>
            </div>

            <Button fullWidth sx={{ mt: 3, borderRadius: '100vw', textTransform: 'initial', bgcolor: '#79dcfd' }} variant="contained">
                Submit
            </Button>
        </>
    )
}

const RangeSlider = ({ min, max, value, handleSliderChange }: {
    min: number, max: number, value: number,
    handleSliderChange: (e: Event, newValue: number | number[]) => void
}) => {

    const step = 50;

    return (
        <Box mt={2}>

            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography fontSize={12} fontWeight={600}>₹ 200</Typography>
                <Typography fontSize={12} fontWeight={600}>₹ {formatNumber(123983)}</Typography>
            </Box>

            {/* Slider component */}
            <Slider
                value={[min, value]} // Fixed minimum value at 200
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => `${ val }`}
                min={min}
                max={max}
                step={step}
                disableSwap
                sx={{
                    '& ::after': {
                        display: 'none'
                    },
                    '& .MuiSlider-track': {
                        border: 'none',
                        py: 0.25,
                        background: `linear-gradient(to right, #f4ec72, #fec70b)`,
                    },
                    '& .MuiSlider-rail': {
                        backgroundColor: '#d3d3d3', // Light gray rail color
                    },
                    '& .MuiSlider-thumb': {
                        backgroundColor: '#fff', // White thumb
                        visibility: 'hidden', // Hide the thumb for the minimum value
                    },
                    '& .MuiSlider-thumb:last-child': {
                        visibility: 'visible', // Show the thumb for the maximum value
                    },
                }}
            />
        </Box>
    );
};
