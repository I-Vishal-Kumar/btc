import { Box, Typography } from "@mui/material";
import PaymentCard from "../PaymentCard";
import { WithdrawMethodToggler } from "./subSections/togle_tabs";
import { WidthdrawMethodTabs, WithdrawalOperationIdentifier, WithdrawalOperationIdentifierType, WithdrawmethodTabsType } from "@/__types__/ui_types/profil.types";
import { Section } from "./WithdrawalFundChildSection";


export const WithdrawalFunds: React.FC<{ activeTab?: WithdrawmethodTabsType }> = ({ activeTab }) => {
    return (
        <div className="p-8">
            <PaymentCard />
            <BankForm activeTab={activeTab} />
        </div>
    )
}


type fields = Record<string, string>
interface FormSection {
    title: string,
    _identifier: WithdrawalOperationIdentifierType,
    fields: fields[]
}


const LocalFormSections: FormSection[] = [
    {
        title: "Bank Details",
        _identifier: WithdrawalOperationIdentifier.LOCAL_BANK_CREATION,
        fields: [
            { placeholder: "Account Holder Name", formFieldName: 'AccHolderName' },
            { placeholder: "Account Number", formFieldName: 'AccNumber' },
            { placeholder: "IFSC Code", formFieldName: 'IfscCode' },
            { placeholder: "Bank Name", formFieldName: 'BankName' },
            { placeholder: "Branch", formFieldName: 'Branch' },
            { placeholder: "Withdrawal Password", type: "password", formFieldName: 'LocalWithdrawPassword' },
        ],
    },
    {
        title: "Withdrawal Funds",
        _identifier: WithdrawalOperationIdentifier.LOCAL_BANK_TRANSFER,
        fields: [
            { placeholder: "Enter Amount", formFieldName: 'Amount' },
            { placeholder: "Withdrawal Password", type: "password", formFieldName: 'WithdrawPassword' },
        ],
    },
    {
        title: "Forgot Withdrawal Password",
        _identifier: WithdrawalOperationIdentifier.LOCAL_BANK_PASS_RESET,
        fields: [
            { placeholder: "Current Password", type: "password", formFieldName: 'CurrWithdrawPassword' },
            { placeholder: "New Password", type: "password", formFieldName: 'NewWithdrawPassword' },
        ],
    },
];
const UsdtFormSections: FormSection[] = [
    {
        title: "Bank Details",
        _identifier: WithdrawalOperationIdentifier.USDT_BANK_CREATION,
        fields: [
            { placeholder: "USDT Address", formFieldName: 'UsdtAddress' },
            { placeholder: "App Name", formFieldName: 'AppName' },
            { placeholder: "Withdrawal Password", type: "password", formFieldName: 'UsdtWithdrawPassword' },
        ],
    },
    {
        title: "Withdrawal Funds",
        _identifier: WithdrawalOperationIdentifier.USDT_BANK_TRANSFER,
        fields: [
            { placeholder: "Enter Amount", formFieldName: 'Amount' },
            { placeholder: "Withdrawal Password", type: "password", formFieldName: 'WithdrawPassword' },
        ],
    },
    {
        title: "Forgot Withdrawal Password",
        _identifier: WithdrawalOperationIdentifier.USDT_BANK_PASS_RESET,
        fields: [
            { placeholder: "Current Password", type: "password", formFieldName: 'CurrWithdrawPassword' },
            { placeholder: "New Password", type: "password", formFieldName: 'NewWithdrawPassword' },
        ],
    },
];

function BankForm({ activeTab = WidthdrawMethodTabs.LOCAL }: { activeTab?: WithdrawmethodTabsType }) {
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
            <WithdrawMethodToggler tab={activeTab} />
            {
                activeTab === WidthdrawMethodTabs.USDT && <Typography textAlign={"end"} fontWeight={500} color="red" >₹ 80 = $ 1</Typography>
            }
            {
                activeTab === WidthdrawMethodTabs.USDT ? (
                    UsdtFormSections.map((section) => (
                        <Section key={section.title} _identifier={section._identifier} title={section.title} fields={section.fields} />
                    ))
                ) : (
                    LocalFormSections.map((section) => (
                        <Section key={section.title} _identifier={section._identifier} title={section.title} fields={section.fields} />
                    ))
                )
            }
        </Box>
    );
}


