import { Box, Container } from "@mui/material"
import { Header } from "../header/Header"
import { getFD } from "@/(backend)/services/fd.services.serv"
import AuthForm from "@/app/(public)/getting-started/page"
import { TermDepositCard } from "./fdCard"
import { HoldingScoreSection } from "./holdingScoreSection"

export const History: React.FC = async () => {

    const { valid, data, operation = null } = await getFD();

    if (operation === 'LOGOUT' || !valid) return <AuthForm />

    return (
        <Container disableGutters sx={{ pt: 2 }}>
            <Header title="Trade History" />
            <Box sx={{ p: 3 }}>
                <HoldingScoreSection />
                <div className="mt-10 grid gap-y-8">
                    {
                        (data || []).map(fd_detail => (
                            <TermDepositCard key={fd_detail._id} fd_detail={fd_detail} />
                        ))
                    }
                </div>
            </Box>
        </Container>
    )
}
