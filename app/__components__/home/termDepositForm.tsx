import { OPTIONS, OptionTypes } from "@/__types__/ui_types/fd.types";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { useFdMutation } from "@/lib/hooks/useFdMutation";
import { Box, Button, Slider, TextField, Typography } from "@mui/material";
import { useState, ChangeEvent } from "react";
import { MdOutlineCurrencyRupee } from "react-icons/md";


export const TermDepositForm = () => {

    const [selectedPlan, setPlan] = useState<OptionTypes>("360day@1%");

    // fd mutation hook.
    const { isPending, maxAmount, minAmount: min, mutate, setValue, value } = useFdMutation({ selectedPlan });

    const handleSliderChange = (_: Event, newValue: number | number[]) => {

        // check if a valid value is provided.
        if (!Array.isArray(newValue)) return;

        setValue(newValue);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {

        const newValue = [min, Number(event.target.value)];
        console.log(newValue);
        // only update if its less than max amount
        if (newValue[1] <= maxAmount) {
            setValue(newValue);
        }

    };

    const getPlanInYears = (plan: OptionTypes) => {
        const planParts = plan.split('day');
        return `${ Number(planParts[0]) / 360 }Years${ planParts[1] }`
    }

    return (
        <>
            <TextField
                label="Amount"
                slotProps={{
                    input: {
                        startAdornment: value[1] ? <MdOutlineCurrencyRupee /> : null
                    }
                }}
                error={!!value[1] && Number(value[1]) < 100}
                helperText={
                    !!value[1] && Number(value[1]) < 100
                        ? "Minimum amount should be ₹100"
                        : ""
                }
                value={value[1] ? value[1] : ""}
                onChange={handleInputChange}
                sx={{
                    mt: 2,
                    bgcolor: 'whitesmoke',
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

            {/* slider for selecting any particular range */}
            <RangeSlider min={min} max={maxAmount} value={value[1] < min ? 0 : value[1]} handleSliderChange={handleSliderChange} />


            <div className="ring-1 ring-gray-300 rounded-md p-1 bg-slate-200">
                <div className="flex flex-col items-center gap-2">
                    <div className="relative w-full">
                        <div className="p-2 text-gray-800 flex items-center justify-between cursor-pointer">
                            <span>{selectedPlan ? getPlanInYears(selectedPlan) : "Select a Plan"}</span>
                        </div>
                        <select
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={selectedPlan}
                            name="plan"
                            title="select a plan"
                            onChange={(e) => setPlan(e.target.value as OptionTypes)}
                        >
                            <option value="" disabled>
                                Select a Plan
                            </option>
                            {Object.keys(OPTIONS).map((key) => (
                                <option key={key} value={key}>
                                    {getPlanInYears(key as OptionTypes)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

            </div>

            <Button onClick={() => mutate()} disabled={
                isPending || !!(value[1] && Number(value[1]) < 100)
            } fullWidth sx={{
                mt: 3, borderRadius: '100vw', textTransform: 'initial',
                background: 'linear-gradient(to right, #f3c45c,#e43905)',
                "&.Mui-disabled": {
                    opacity: 0.5,
                    background: 'linear-gradient(to right, #f3c45c,#e43905)',
                },
            }} variant="contained">
                {isPending ? "Loading...." : 'Submit'}
            </Button>
        </>
    )
}

type RangeSliderProps = {
    min: number, max: number, value: number,
    handleSliderChange: (e: Event, newValue: number | number[]) => void
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, value, handleSliderChange }) => {

    // ignore point values 0.1 -> one value precesion is allowed.
    const step = 50;

    return (
        <Box mt={2}>

            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography fontSize={12} fontWeight={600}>₹ {min}</Typography>
                <Typography fontSize={12} fontWeight={600}>₹ {formatNumber(max)}</Typography>
            </Box>

            {/* Slider component */}
            <Slider
                value={[min, value]} // Fixed minimum value at 100
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
