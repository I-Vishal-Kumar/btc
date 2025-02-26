"use client"

import { useRouter } from "next/navigation"

type SectionProps = {
    name: string,
    value?: number | string,
    pathTo?: string
}
export const ChildSection: React.FC<SectionProps> = ({ name, pathTo, value }) => {

    const router = useRouter();

    return (
        <div
            {...pathTo && { onClick: () => router.push(pathTo) }}
            className="p-2 py-3 font-medium ring-1 bg-[#f1f1f1] text-sm ring-gray-300 rounded-md">
            <p className="inline-flex pl-2">{name}</p>
            <p className="inline-flex pl-2 font-semibold  tracking-wide ">{value}</p>
        </div>
    )
}