"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function useQueryParams() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const setQueryParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${ params.toString() }`, { scroll: false });
    };

    const deleteQueryParam = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        router.push(`?${ params.toString() }`, { scroll: false });
    };

    return { setQueryParam, deleteQueryParam };
}
