"use client"

import { GatewayTypes } from "@/__types__/db.types";
import { Box, TextField, Button } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, useState } from "react";
import { DefaultGateway } from "./defaultGatewayPage";
import { AdminConfigType } from "@/__types__/admin.types";

export const PaymentForm: React.FC<{ gatewayType: GatewayTypes, config: AdminConfigType }> = ({ gatewayType, config }) => {


    const [amount, setAmount] = useState<number | string>("");
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [isDefaultGateway, setDefaultGateway] = useState<boolean>(false);

    const predefinedAmounts = [1000, 10000, 50000, 100000];

    const handleAmountClick = (value: number) => {
        setSelectedAmount(value);
        setAmount(value);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
        setSelectedAmount(null);
    };

    const handleSubmit = () => {

        // validate minimum amount.
        if (Number(amount) < 500) return enqueueSnackbar("Minimum deposit amount is 500", { variant: 'warning' })

        const fn = ({
            [GatewayTypes.DEFAULT]: () => setDefaultGateway(true),
            [GatewayTypes.AUTO_1]: () => { },
            [GatewayTypes.AUTO_2]: () => { }
        })[gatewayType]

        fn()
    };

    if (isDefaultGateway) return <DefaultGateway amount={Number(amount)} config={config} />

    return (
        <Box className="flex flex-col items-center p-6 mx-auto">
            <p className="text-gray-700 w-full text-start font-medium mb-4">Choose Amount Or Enter Amount</p>

            {/* Predefined Amount Buttons */}
            <div className="flex justify-evenly w-full mb-4">
                {predefinedAmounts.map((amt) => (
                    <button
                        type="button"
                        key={amt}
                        className={`px-4 py-1 border rounded-full ${ selectedAmount === amt ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                        onClick={() => handleAmountClick(amt)}
                    >
                        {amt.toLocaleString()}
                    </button>
                ))}
            </div>

            {/* Manual Input Field */}
            <TextField
                variant="outlined"
                fullWidth
                size="small"
                sx={{
                    "& input": {
                        textAlign: "center",
                    },
                    "& .MuiInputBase-input::placeholder": {
                        textAlign: "center",
                    },
                }}
                className="mb-4"
                placeholder="Enter Amount"
                value={amount}
                onChange={handleChange}
                type="number"
            />

            {/* Payment Method */}
            <div className="flex justify-between w-full my-3 rounded-md ring-1 ring-slate-300 items-center py-2 px-2 bg-slate-200">
                <p>Payment Channel {gatewayType}</p>
                <input type="radio" onChange={() => null} checked={true} aria-label="none" />
            </div>

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
};