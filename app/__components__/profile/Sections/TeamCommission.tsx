import { formatNumber } from "@/lib/helpers/numberFormatter"
import { RenderInvitationLink } from "../../_commonComponents/RenderInvitationLink"
import PaymentCard from "../PaymentCard"
import { Box, Typography } from "@mui/material"

const Sections = {
    "Team Transaction": [
        { name: "Total Deposit", value: `₹ ${ formatNumber(23423) }` },
        { name: "Total Withdrawal", value: `₹ ${ formatNumber(23423) }` },
    ],
    "Team Report": [
        { name: "Today New Registration", value: 234 },
        { name: "Direct Active Members", value: 2342 },
        { name: "Total Active Members", value: 5234 },
    ]
}

export const TeamCommission: React.FC = () => {
    return (
        <div className="p-8">

            <PaymentCard client="commission" />
            <div className="mt-8 bg-[#efefef] rounded-md ">
                <RenderInvitationLink sx={{ bgcolor: 'none', py: 0.5 }} />
            </div>
            <div className="grid gap-y-4 mt-10">
                {
                    Object.entries(Sections).map(([title, childSections], i) => (
                        <Box key={i} sx={{ display: 'grid', rowGap: 2 }}>
                            <Typography fontSize={12} fontWeight={600} >{title}</Typography>
                            {
                                childSections.map((section, i) => (
                                    <div key={section.name} className="p-2 py-3 font-medium ring-1 bg-[#f1f1f1] text-sm ring-gray-300 rounded-md">
                                        <p className="inline-flex pl-2">{section.name}</p>
                                        <p className="inline-flex pl-2 font-semibold  tracking-wide ">{section.value}</p>
                                    </div>
                                ))
                            }
                        </Box>
                    ))
                }
            </div>
        </div>
    )
}

