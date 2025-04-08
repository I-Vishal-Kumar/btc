import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { USER } from "@/(backend)/(modals)/schema/user.schema"
import { TransactionStatusType, TransactionType } from "@/__types__/db.types";

const SuperAdmin: React.FC = async () => {
    const count = await USER.countDocuments();

    const deposits = await TRANSACTION.aggregate([
        { $match: { Type: TransactionType.DEPOSIT, Status: TransactionStatusType.SUCCESS } },
        { $group: { _id: null, total: { $sum: "$Amount" } } }
    ]);

    const withdrawals = await TRANSACTION.aggregate([
        { $match: { Type: TransactionType.WITHDRAWAL, Status: TransactionStatusType.SUCCESS } },
        { $group: { _id: null, total: { $sum: "$Amount" } } }
    ]);

    const totalDeposit = deposits[0]?.total || 0;
    const totalWithdrawals = withdrawals[0]?.total || 0;
    const totalProfit = totalDeposit - totalWithdrawals;

    return (
        <div className="p-4 space-y-2">
            <p>Total users: <strong>{count}</strong></p>
            <p>Total deposit: <strong>₹{totalDeposit.toFixed(2)}</strong></p>
            <p>Total withdrawals: <strong>₹{totalWithdrawals.toFixed(2)}</strong></p>
            <p>Total profit: <strong>₹{totalProfit.toFixed(2)}</strong></p>
        </div>
    )
}

export default SuperAdmin;
