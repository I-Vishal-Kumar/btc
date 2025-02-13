import { Box, Typography, Button, TextField } from "@mui/material";
import PaymentCard from "../PaymentCard";


export const WithdrawalFunds: React.FC = () => {
    return (
        <div className="p-8">
            <PaymentCard />
            <BankForm />
        </div>
    )
}


type fields = Record<string, string>
interface FormSection {
    title: string,
    fields: fields[]
}

const formSections: FormSection[] = [
    {
        title: "Bank Details",
        fields: [
            { placeholder: "Account Holder Name" },
            { placeholder: "Account Number" },
            { placeholder: "IFSC Code" },
            { placeholder: "Bank Name" },
            { placeholder: "Withdrawal Password", type: "password" },
        ],
    },
    {
        title: "Withdrawal Funds",
        fields: [
            { placeholder: "Enter Amount" },
            { placeholder: "Withdrawal Password", type: "password" },
        ],
    },
    {
        title: "Forgot Withdrawal Password",
        fields: [
            { placeholder: "Current Password", type: "password" },
            { placeholder: "New Password", type: "password" },
        ],
    },
];

function BankForm() {
    return (
        <Box
            sx={{
                maxWidth: 400,
                mx: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 2
            }}
        >
            {formSections.map((section, index) => (
                <Section key={index} title={section.title} fields={section.fields} />
            ))}

            <Button
                variant="contained"
                fullWidth
                size="small"
                sx={{
                    bgcolor: "#89CEFF",
                    color: "white",
                    boxShadow: 'none',
                    fontSize: "16px",
                    textTransform: "none",
                    borderRadius: "24px",
                    mt: 2,
                    "&:hover": { bgcolor: "#6db9e8" },
                }}
            >
                Submit
            </Button>
        </Box>
    );
}

const Section = ({ title, fields }: { title: string, fields: fields[] }) => (
    <Box>
        <Typography fontWeight={600} mt={2}>{title}</Typography>
        {fields.map((field, index) => (
            <TextField label={field.placeholder} key={index} size="small" variant="outlined" placeholder={field.placeholder} fullWidth type={field.type || "text"} sx={{ mt: 1, bgcolor: '#ebebeb' }} />
        ))}
    </Box>
);

