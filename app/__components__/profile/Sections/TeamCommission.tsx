'use client';

import { formatNumber } from "@/lib/helpers/numberFormatter";
import { RenderInvitationLink } from "../../_commonComponents/RenderInvitationLink";
import PaymentCard from "../PaymentCard";
import { Box, Typography } from "@mui/material";
import { ChildSection } from "./CommissionChildSection";
import { CommissionPageDetailType, SubSectionsAvailable } from "@/__types__/ui_types/profil.types";
import AuthForm from "@/app/(public)/getting-started/page";
import { useQuery } from "@tanstack/react-query";

const SectionWithDetails = (data: CommissionPageDetailType) => {
    return {
        "Team Transaction": [
            // { name: "Total Deposit", value: `₹ ${ formatNumber(data?.totalDeposit) }` },
            // { name: "Total Withdrawal", value: `₹ ${ formatNumber(data.totalWithdrawal) }` },
            // { name: "Today Deposit", value: `₹ ${ formatNumber(data?.todayDeposit) }`, pathTo: `/profile/team_commission/${ SubSectionsAvailable.TODAY_DEPOSIT }?activeTab=today` },
            { name: "Today Withdrawal", value: `₹ ${ formatNumber(data?.todayWithdrawal) }` },
            { name: "Today Deposit", value: `₹ ${ formatNumber(data?.todayDeposit) }` },
            // { name: "Today Withdrawal", value: `₹ ${ formatNumber(data?.todayWithdrawal) }` },
        ],
        "Team Report": [
            { name: "Today New Registration", value: data.todayNewRegistration, pathTo: `/profile/team_commission/${ SubSectionsAvailable.TODAY_REGISTRATION }?activeTab=today` },
            { name: "Direct Active Members", value: data.directActiveMembers },
            { name: "Total Active Members", value: data.TotalActiveMembers },
            { name: "Total Claim FD", value: data.totalBookedFd },
        ]
    };
};

const fetchCommissionPageDetails = async () => {
    const res = await fetch('/api/commission');
    if (!res.ok) throw new Error('Failed to fetch commission page details');
    return res.json();
};

export const TeamCommission: React.FC = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['commission-page-details'],
        queryFn: fetchCommissionPageDetails,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    if (isLoading) return <div>Loading...</div>;

    if (isError || !data?.valid || !data?.data) {
        return <AuthForm />;
    }

    const Sections = SectionWithDetails(data.data);

    return (
        <div className="p-8">
            <PaymentCard client="commission" />

            <div className="mt-8 bg-[#efefef] rounded-md">
                <RenderInvitationLink sx={{ bgcolor: 'none', py: 0.5 }} />
            </div>

            <div className="grid gap-y-4 mt-10">
                {Object.entries(Sections).map(([title, childSections]) => (
                    <Box key={title} sx={{ display: 'grid', rowGap: 2 }}>
                        <Typography fontSize={12} fontWeight={600}>{title}</Typography>
                        {childSections.map((section, index) => (
                            <div key={`${ title }-${ section.name || `section-${ index }` }`}>
                                <ChildSection {...section} />
                            </div>
                        ))}
                    </Box>
                ))}
            </div>
        </div>
    );
};
