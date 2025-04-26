import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { USER_CONTEXT } from "./user.context";
import { OPTIONS, OptionTypes } from "@/__types__/ui_types/fd.types";
import { createFD } from "@/(backend)/services/fd.services.serv";

type UseFdMutationProps = {
    selectedPlan: OptionTypes;
};


// creates fd -----------------------------

export const useFdMutation = ({ selectedPlan }: UseFdMutationProps) => {

    const { setUserInfo } = useContext(USER_CONTEXT);
    const details = OPTIONS[selectedPlan];
    const maxAmount = details?.max || -1;
    const minAmount = details?.min || -1;

    const [value, setValue] = useState<number[]>([0, 0]);

    const { isSuccess, isError, isPending, data, mutate } = useMutation({
        mutationFn: async () => {
            const fdAmount = Math.max(value[0], value[1]);
            if (OPTIONS[selectedPlan] && fdAmount >= minAmount) {
                return createFD({ FD_amount: fdAmount, duration: selectedPlan });
            } else {
                return Promise.resolve({ valid: false, msg: "Wrong amount selected" });
            }
        }
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

    return { isPending, mutate, value, setValue, maxAmount, minAmount };
};
