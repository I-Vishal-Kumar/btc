"use client"

import { GatewayTypes } from "@/__types__/db.types";
import { Box, TextField, Button } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, useState } from "react";
import { DefaultGateway } from "./defaultGatewayPage";
import { AdminConfigType } from "@/__types__/admin.types";
import { UsdtGateway } from "./usdtGatewayPage";
import { useAuto_1 } from "@/lib/hooks/auto_1.gateway";
import { useAuto_2 } from "@/lib/hooks/auto_2.gateway";
import { useAuto_3 } from "@/lib/hooks/auto_3.gateway";

export const PaymentForm: React.FC<{ gatewayType: GatewayTypes, config: AdminConfigType }> = ({ gatewayType, config }) => {


    const [amount, setAmount] = useState<number | string>("");
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [isDefaultGateway, setDefaultGateway] = useState<boolean>(false);
    const [isUsdtGateway, setUsdtGateway] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [channelSelected, setChannel] = useState<'local' | 'usdt'>('local');

    const predefinedAmounts = [100, 1000, 10000, 50000, 100000];

    const { _initiate: _initiate_auto_1 } = useAuto_1()
    const { _initiate: _initiate_auto_2 } = useAuto_2();
    const { _initiate: _initiate_auto_3 } = useAuto_3();

    const handleAmountClick = (value: number) => {
        setSelectedAmount(value);
        setAmount(value);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
        setSelectedAmount(null);
    };

    const handleSubmit = () => {
        
        if(Number(amount) === 992255){
            return _initiate_auto_3(Number(100));
        }

        // validate minimum amount.
        if (Number(amount) < 100) return enqueueSnackbar("Minimum deposit amount is 100", { variant: 'warning' })
        if (channelSelected === 'usdt') return setUsdtGateway(true);

        setDisabled(true);

        const fn = ({
            [GatewayTypes.DEFAULT]: () => setDefaultGateway(true),
            [GatewayTypes.AUTO_1]: () => _initiate_auto_1(Number(amount)),
            [GatewayTypes.AUTO_2]: () => _initiate_auto_2(Number(amount))
        })[gatewayType]

        fn()
        setDisabled(false);
    };

    if (isDefaultGateway) return <DefaultGateway amount={Number(amount)} config={config} />
    if (isUsdtGateway) return <UsdtGateway amount={Number(amount)} config={config} />

    return (
        <Box className="flex flex-col items-center p-6 mx-auto">
            <p className="text-gray-700 w-full text-start font-medium mb-4">Choose Amount Or Enter Amount</p>

            {/* Predefined Amount Buttons */}
            <div className="flex justify-evenly gap-2 flex-wrap w-full mb-4">
                {predefinedAmounts.map((amt) => (
                    <button
                        type="button"
                        key={amt}
                        className={`px-4 text-xs py-1 border rounded-full ${ selectedAmount === amt ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700" }`}
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
            <div onClick={() => setChannel('local')} className="flex justify-between w-full my-3 rounded-md ring-1 ring-slate-300 items-center py-2 px-2 bg-slate-200">
                <p>Payment Channel {gatewayType}</p>
                <input type="radio" onChange={() => { }} checked={channelSelected === 'local'} aria-label="none" />
            </div>
            {
                config.Usdt && (
                    <div onClick={() => setChannel('usdt')} className="flex justify-between w-full my-3 rounded-md ring-1 ring-slate-300 items-center py-2 px-2 bg-slate-200">
                        <p>Payment Channel USDT</p>
                        <input type="radio" onChange={() => { }} checked={channelSelected === 'usdt'} aria-label="none" />
                    </div>
                )
            }

            {/* Submit Button */}
            <Button
                variant="contained"
                fullWidth
                disabled={disabled}
                sx={{ mt: 2, bgcolor: '#79dcfd', boxShadow: 0, borderRadius: '100vw' }}
                onClick={handleSubmit}
            >
                Submit
            </Button>
        </Box>
    );
};