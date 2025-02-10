import { HeroSection } from "@/app/__components__/profile/HeroSection"
import { NavigationSection } from "@/app/__components__/profile/NavigationSection"
import { Container } from "@mui/material"


export default function Profile() {

    return (
        <Container maxWidth="md">
            <HeroSection />
            <NavigationSection />
        </Container>
    )
}
