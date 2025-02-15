import { formatNumber } from "@/lib/helpers/numberFormatter"
import { RenderInvitationLink } from "../../_commonComponents/RenderInvitationLink"
import PaymentCard from "../PaymentCard"
import { Box, Typography } from "@mui/material"
import { ChildSection } from "./CommissionChildSection"
import { SubSectionsAvailable } from "@/__types__/ui_types/profil.types"

const Sections = {
    "Team Transaction": [
        { name: "Total Deposit", value: `₹ ${ formatNumber(23423) }` },
        { name: "Total Withdrawal", value: `₹ ${ formatNumber(23423) }` },
        { name: "Today Deposit", pathTo: `/profile/team_commission/${ SubSectionsAvailable.TODAY_DEPOSIT }?activeTab=today` },
        { name: "Today Withdrawal", pathTo: `/profile/team_commission/${ SubSectionsAvailable.TODAY_WITHDRAWAL }?activeTab=today` },
    ],
    "Team Report": [
        { name: "Today New Registration", value: 234, pathTo: `/profile/team_commission/${ SubSectionsAvailable.TODAY_REGISTRATION }?activeTab=today` },
        { name: "Direct Active Members", value: 2342, pathTo: `/profile/team_commission/${ SubSectionsAvailable.DIRECT_MEMBERS }?activeTab=today` },
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
                    Object.entries(Sections).map(([title, childSections]) => (
                        <Box key={title} sx={{ display: 'grid', rowGap: 2 }}>
                            <Typography fontSize={12} fontWeight={600}>{title}</Typography>
                            {
                                childSections.map((section, index) => (
                                    <div key={`${ title }-${ section.name || `section-${ index }` }`}>
                                        <ChildSection {...section} />
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

