import { Container } from "@mui/material"
import { Header } from "../../header/Header"
import { Suspense } from "react"

export const SectionWrapper: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {

    return (
        <Container disableGutters>
            <Suspense>
                <Header title={title} />
            </Suspense>
            {children}
        </Container>
    )

}