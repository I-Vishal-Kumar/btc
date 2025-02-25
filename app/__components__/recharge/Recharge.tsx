import { Box, Container, Typography } from "@mui/material"
import Image from "next/image"
import { PaymentForm } from "./PaymentForm";
import { getAdminConfig } from "@/(backend)/services/admin.service.serve";
import AuthForm from "@/app/(public)/getting-started/page";

export const RechargeDashboard: React.FC = async () => {

    const { valid, data } = await getAdminConfig();

    if (!valid || !data) return <AuthForm />

    return (
        <Container disableGutters sx={{ position: 'relative' }} >
            <div className="relative h-[40vh] w-full">
                <Image
                    src={"/assets/recharge_bg.jpg"}
                    fill
                    priority
                    objectFit="cover"
                    alt="recharge"
                />
            </div>
            <Box p={3} >
                <Typography variant="overline" fontSize={12} fontWeight={600} >being a partner in one step</Typography>
                <PaymentForm gatewayType={data.Gateway} config={data} />
            </Box>
        </Container>
    )
}


