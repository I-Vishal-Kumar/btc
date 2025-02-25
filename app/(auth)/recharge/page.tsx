import { Header } from "@/app/__components__/header/Header";
import { RechargeDashboard } from "@/app/__components__/recharge/Recharge";
import { Container } from "@mui/material";

export default function Recharge() {
    return (
        <Container disableGutters >
            <Header title="Recharge" />
            <RechargeDashboard />
        </Container>
    )
}
