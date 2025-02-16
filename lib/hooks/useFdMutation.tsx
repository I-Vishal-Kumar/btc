import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { USER_CONTEXT } from "./user.context";
import { OPTIONS, OptionTypes } from "@/__types__/ui_types/fd.types";
import { createFD } from "@/(backend)/services/fd.services.serv";

type UseFdMutationProps = {
    selectedPlan: OptionTypes;
    minAmount: number;
};


// creates fd -----------------------------

export const useFdMutation = ({ selectedPlan, minAmount }: UseFdMutationProps) => {

    const { setUserInfo } = useContext(USER_CONTEXT);

    const [value, setValue] = useState<number[]>([minAmount, 0]);

    const maxAmount = OPTIONS[selectedPlan]?.max || minAmount;

    const { isSuccess, isError, isPending, data, mutate } = useMutation({
        mutationFn: async () => {
            if (OPTIONS[selectedPlan] && Math.max(value[0], value[1]) > minAmount) {
                return createFD({ FD_amount: Math.max(value[0], value[1]), duration: selectedPlan });
            }
        },
    });

    useEffect(() => {
        if (isSuccess) {
            if (data?.valid) {
                setUserInfo((prev) => ({
                    ...prev,
                    Balance: prev.Balance - Math.max(value[0], value[1]),
                }));
                setValue([minAmount, 0]);
            }
            enqueueSnackbar(data?.msg || "Something went wrong", {
                variant: data?.valid ? "success" : "error",
            });
        } else if (isError) {
            enqueueSnackbar("Something went wrong", { variant: "error" });
        }
    }, [isSuccess, isError, data]);

    useEffect(() => {
        if (value[1] > maxAmount) {
            setValue([value[0], maxAmount]);
        }
    }, [selectedPlan]);

    return { isPending, mutate, value, setValue, maxAmount };
};
