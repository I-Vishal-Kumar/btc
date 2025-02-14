import { SubSectionsAvailable } from "@/__types__/ui_types/profil.types";
import { Header } from "@/app/__components__/header/Header";
import { DirectMembers } from "@/app/__components__/profile/Sections/subSections/direct_members";
import { TodayDeposit } from "@/app/__components__/profile/Sections/subSections/today_deposit";
import { TodayRegistration } from "@/app/__components__/profile/Sections/subSections/today_registration";
import { TodayWithdrawal } from "@/app/__components__/profile/Sections/subSections/today_withdrawal";
import { Container } from "@mui/material";


export default async function ChildSections({ params }: { params: Promise<{ child_section: SubSectionsAvailable }> }) {

    const { child_section } = await params;

    const ActiveSection = (
        {
            [SubSectionsAvailable.TODAY_DEPOSIT]: TodayDeposit,
            [SubSectionsAvailable.TODAY_WITHDRAWAL]: TodayWithdrawal,
            [SubSectionsAvailable.TODAY_REGISTRATION]: TodayRegistration,
            [SubSectionsAvailable.DIRECT_MEMBERS]: DirectMembers
        }
    )[child_section]

    return (
        <Container disableGutters>
            <Header title={child_section} />
            <ActiveSection />
        </Container>
    )
}