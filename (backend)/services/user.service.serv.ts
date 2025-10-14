"use server";

import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken";
import { cookies } from "next/headers";
import { USER } from "@/(backend)/(modals)/schema/user.schema";
import { ServiceReturnType } from "@/__types__/service.types";
import { UserType, UserWallet, VideoType } from "@/__types__/user.types";
import { DateTime } from "luxon";
import { WALLET } from "../(modals)/schema/userWalled.schema";
import { TRANSACTION } from "../(modals)/schema/transaction.schema";
import {
    db_schema,
    EarningType,
    FdStatus,
    TransactionStatusType,
    TransactionType,
    VideoApprovalStatusType,
    VideoEarningType,
    VideoVissibilityStatusType,
} from "@/__types__/db.types";
import {
    ActiveTabs,
    CommissionPageDetailType,
} from "@/__types__/ui_types/profil.types";
import { IncomeType, TransactionObjType } from "@/__types__/transaction.types";
import { INCOME } from "../(modals)/schema/incomeConfig.schema";
import { VIDEO_EARNING } from "../(modals)/schema/videoEarning.schema";
import mongoose from "mongoose";
import { VIDEOS } from "../(modals)/schema/videos.schema";
import { FD } from "../(modals)/schema/fixedDeposit.schema";
// import { handleAutoWithdraw4 } from "@/lib/helpers/handleAutoWithdraw4";

// handleAutoWithdraw4({
//     payout : {
//         AccountNo : '6083000100106919',
//         Amount : 100,
//         APIRequestID: Date.now().toString(),
//         BankName: 'Punjab National Bank',
//         BeneMobile: '8767456646',
//         BeneName: 'Himanshu Kumar', 
//         IFSC: 'PUNB0608300'
//     }
// })
export const getUserDetails = async (): ServiceReturnType<UserType> => {
    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        if (!token) return { valid: false, data: undefined };

        const { success, decoded = null } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false };

        await CONNECT();

        const dbUser = await USER.findOne(
            {
                PhoneNumber: decoded.PhoneNumber,
                Blocked: false,
                Session: token,
            },
            { _id: 0, Session: 0, Password: 0, createdAt: 0, updatedAt: 0 }
        );

        if (!dbUser || dbUser.Blocked) return { valid: false };

        return { valid: true, data: dbUser?.toObject() };
    } catch (error) {
        console.log(error);
        return { valid: false, operation: "LOGOUT" };
    }
};

// console.log('logging')
// const start = DateTime.fromJSDate(new Date('2025-08-08')).startOf('day');
// const end = DateTime.fromJSDate(new Date('2025-06-12')).endOf("day")
// await CONNECT();
// const endOf12th = DateTime.fromJSDate(new Date("2025-10-12")).endOf('day');
// const closingDate = DateTime.fromJSDate(new Date("2025-08-09")).startOf('day');

// const users = await TRANSACTION.distinct("PhoneNumber", {
//     Type: TransactionType.DEPOSIT,
//     createdAt : {
//         $gte : closingDate,
//         $lte : endOf12th,
//     }
// });
// for (const u of users) {
//   console.log(u);
// }
// const user = await WALLET.findOne({ PhoneNumber: "9250206415" });
// console.log(user);
// USER.find({createdAt : {$gte : start}}).then(d => {
//     for (const u of d) {
//         console.log(u.PhoneNumber)
//     }
// })
// const updated = await USER.updateMany({
//     PhoneNumber : {$in : [
//         '9250206422',
//         '9250206888',
//         '9250206999',
//         '9250201411',
//         '9250201455',
//         '9250201466',
//         '9250206495',
//         "9250201766",
//         "9250203366",
//         "9250205555",
//         "9250201788",
//         "9250201799",
//         "9250201666",
//     ]}
// }, {
//     $set: {
//         Blocked : true
//     }
// })
// console.log(updated);
// USER.find(
//     {
//         // createdAt : {
//         //     $gte : start,
//         //     // $lte : end,
//         // },
//         // Deposited: true,
//     },
//     { PhoneNumber: 1, _id: 0 }
// )
//     .lean()
//     .then((data) => {
//         data.forEach((d) => console.log(d.PhoneNumber));
//     })
//     .catch((err) => console.log(err));

// GET USER WITHDRAWAL DETAILS =========================

export const getUserWithdrawalDetails = async (): ServiceReturnType<
    TransactionObjType[]
> => {
    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        const transactions = (await TRANSACTION.find({
            PhoneNumber: decoded.PhoneNumber,
            Type: TransactionType.WITHDRAWAL,
        })
            .sort({ createdAt: -1 })
            .lean()) as unknown as TransactionObjType[];

        return {
            valid: true,
            data: JSON.parse(JSON.stringify(transactions)) || [],
        };
    } catch (error) {
        if (error instanceof Error) return { valid: false, msg: error.message };
        return { valid: false, msg: "Something went wrong." };
    }
};

// ==================================

// CLAIM PER DAY GIFT ===================================

export const claimGift = async (): ServiceReturnType<{
    GIFT_AMOUNT: number;
}> => {
    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        const dbUser: UserType | null = await USER.findOne({
            PhoneNumber: decoded.PhoneNumber,
        });

        if (!dbUser) throw new Error("Could not claim this time try again.");

        const today = DateTime.now().get("day");
        const lastSpinDate = dbUser.LastSpinAt
            ? DateTime.fromJSDate(new Date(dbUser.LastSpinAt)).get("day")
            : null;

        if (lastSpinDate && lastSpinDate === today)
            return { valid: false, msg: "You can now claim tomorrow." };

        // generate a random gift amount between 1 - 1.5
        const GIFT_AMOUNT = Number((1 + Math.random()).toFixed(2));

        await USER.findOneAndUpdate(
            { PhoneNumber: decoded.PhoneNumber },
            {
                $inc: {
                    Balance: GIFT_AMOUNT,
                    Profit: GIFT_AMOUNT,
                },
                $set: {
                    LastSpinAt: DateTime.now().toISO(),
                },
            }
        );

        // add income information for this user.
        await INCOME.create([
            {
                PhoneNumber: dbUser.PhoneNumber,
                InvitationCode: dbUser.InvitationCode,
                Parent: dbUser.Parent,
                Type: IncomeType.DAILY_GIFT,
                Amount: GIFT_AMOUNT,
            },
        ]);

        return {
            valid: true,
            data: { GIFT_AMOUNT },
            msg: `You have won ${GIFT_AMOUNT} 🎉`,
        };
    } catch (error) {
        if (error instanceof Error) return { valid: false, msg: error.message };
        return { valid: false, msg: "Something went wrong." };
    }
};

// ====================================

// GET USER WALLET DETAILS ==============================

export const getWalletDetails = async (): ServiceReturnType<UserWallet> => {
    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        const walletDetails = await WALLET.findOne(
            { PhoneNumber: decoded.PhoneNumber },
            { UsdtWithdrawPassword: 0, LocalWithdrawPassword: 0, _id: 0 }
        );

        return { valid: true, data: walletDetails?.toObject() as UserWallet };
    } catch (error) {
        if (error instanceof Error)
            return { valid: false, msg: error.message, operation: "LOGOUT" };
        return { valid: false, msg: "Something went wrong." };
    }
};

// ===========================================

// GET USER TEAM COMMISION PAGE DETAILS ======================
export const getCommissionPageDetails =
    async (): ServiceReturnType<CommissionPageDetailType> => {
        try {
            const cookie = await cookies();
            const token = cookie.get("token")?.value || "";

            const { success, decoded } = await VerifyToken(token);

            if (!success || !decoded)
                return { valid: false, operation: "LOGOUT" };

            await CONNECT();

            const userDetails: UserType | null = await USER.findOne({
                PhoneNumber: decoded.PhoneNumber,
            });

            if (!userDetails) throw new Error("Could not find the user");

            // get total deposit and withdrawal data up to 6 level's
            const [details, memberDetails, bookedFD] = await Promise.all([
                getTotalDetails(userDetails.InvitationCode),
                getMemberDetails(userDetails.InvitationCode),
                getBookedFD(userDetails.InvitationCode),
            ]);

            if (!details || !memberDetails)
                throw new Error("Something went wrong");

            return {
                valid: true,
                data: {
                    ...details,
                    ...memberDetails,
                    totalBookedFd: bookedFD || 0,
                },
            };
        } catch (error) {
            if (error instanceof Error)
                return {
                    valid: false,
                    msg: error.message,
                    operation: "LOGOUT",
                };
            return { valid: false, msg: "Something went wrong." };
        }
    };

export async function getTotalDetails(invitationCode: string) {
    try {
        const today = DateTime.now().startOf("day"); // Get today's start time

        // Object to store totals (passed recursively to avoid extra iteration)
        const totals = {
            todayDeposit: 0,
            todayWithdrawal: 0,
            totalDeposit: 0,
            totalWithdrawal: 0,
        };

        async function fetchTransactions(invCodes: string[], level: number) {
            if (level > 6 || invCodes.length === 0) return;

            // Fetch transactions at this level
            const transactions = await TRANSACTION.find(
                {
                    Parent: { $in: invCodes },
                    Type: {
                        $in: [
                            TransactionType.DEPOSIT,
                            TransactionType.WITHDRAWAL,
                        ],
                    },
                    Status: TransactionStatusType.SUCCESS,
                },
                {
                    Amount: 1,
                    Type: 1,
                    InvitationCode: 1,
                    PhoneNumber: 1,
                    createdAt: 1,
                }
            );
            // if (!transactions.length) return;

            // Prepare next level invitation codes
            const nextLevelInvites: string[] = [];

            // Process transactions and update totals
            transactions.forEach((tx) => {
                const isToday = DateTime.fromJSDate(tx.createdAt).hasSame(
                    today,
                    "day"
                );
                if (tx.Type === TransactionType.DEPOSIT) {
                    totals.totalDeposit += tx.Amount;
                    if (isToday) totals.todayDeposit += tx.Amount;
                } else if (tx.Type === TransactionType.WITHDRAWAL) {
                    totals.totalWithdrawal += tx.Amount;
                    if (isToday) totals.todayWithdrawal += tx.Amount;
                }
            });

            const nextLevelUsers = await USER.find(
                {
                    Parent: { $in: invCodes },
                    $or: [{ Deposited: true }, { ReferalCount: { $gte: 1 } }],
                },
                { InvitationCode: 1 }
            );

            if (!nextLevelUsers?.length || level === 6) return;

            nextLevelUsers.forEach((user) =>
                nextLevelInvites.push(user.InvitationCode)
            );

            // Recursively fetch the next level
            await fetchTransactions(nextLevelInvites, level + 1);
        }

        // Start recursion from Level 1
        await fetchTransactions([invitationCode], 1);

        return totals;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return null;
    }
}

export async function getBookedFD(invitationCode: string) {
    try {
        // Object to store totals (passed recursively to avoid extra iteration)
        let total = 0;

        async function fetchTransactions(invCodes: string[], level: number) {
            if (level > 6 || invCodes.length === 0) return;

            // Fetch transactions at this level
            const thisLevel = await FD.aggregate([
                {
                    $match: {
                        Parent: { $in: invCodes },
                        FdStatus: FdStatus.PROGRESS,
                    },
                },
                {
                    $group: {
                        _id: "$PhoneNumber",
                    },
                },
                {
                    $count: "uniquePhoneCount",
                },
            ]);

            // Prepare next level invitation codes
            const nextLevelInvites: string[] = [];

            total += Number(thisLevel[0]?.uniquePhoneCount || 0);

            const nextLevelUsers = await USER.find(
                {
                    Parent: { $in: invCodes },
                    $or: [{ Deposited: true }, { ReferalCount: { $gte: 1 } }],
                },
                { InvitationCode: 1 }
            );

            if (!nextLevelUsers?.length || level === 6) return;

            nextLevelUsers.forEach((user) =>
                nextLevelInvites.push(user.InvitationCode)
            );

            // Recursively fetch the next level
            await fetchTransactions(nextLevelInvites, level + 1);
        }

        // Start recursion from Level 1
        await fetchTransactions([invitationCode], 1);

        return total;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return null;
    }
}

async function getMemberDetails(invitationCode: string) {
    try {
        const details = {
            todayNewRegistration: 0,
            directActiveMembers: 0,
            TotalActiveMembers: 0,
        };
        const today = DateTime.now().startOf("day"); // Get today's start time

        async function getDetails(invitationCodes: string[], level: number) {
            if (level > 6 || !invitationCodes.length) return;

            const users = await USER.find(
                { Parent: { $in: invitationCodes } },
                { createdAt: 1, InvitationCode: 1, Deposited: 1 }
            );

            if (!users || !users.length) return;

            const nextLevelInvites: string[] = [];

            for (const user of users) {
                const isToday = DateTime.fromJSDate(user.createdAt).hasSame(
                    today,
                    "day"
                );
                if (isToday) details.todayNewRegistration++;
                if (level === 1 && user.Deposited)
                    details.directActiveMembers++;
                if (user.Deposited) details.TotalActiveMembers++;

                nextLevelInvites.push(user.InvitationCode);
            }

            await getDetails(nextLevelInvites, level + 1);
        }

        await getDetails([invitationCode], 1);
        return details;
    } catch (error) {
        console.log("Error while getting member details", error);
        return null;
    }
}
// =======================================

// Get today deposit | withdrawal user details ==================

export const getTodayDepositWithdrawalUsers = async (
    Type: TransactionType,
    tab: ActiveTabs,
    page: number = 1,
    level: number = 1
): ServiceReturnType<TransactionObjType[]> => {
    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        const userDetails: UserType | null = await USER.findOne({
            PhoneNumber: decoded.PhoneNumber,
        });

        if (!userDetails) throw new Error("Could not find the user");

        const pageSize = 10; // Number of records per page
        const skip = (page - 1) * pageSize;

        const startOfDay = DateTime.utc().startOf("day");
        const endOfDay = DateTime.utc().endOf("day");

        let invitationCodes = [userDetails.InvitationCode];

        // Recursively get users at the specified level
        for (let i = 1; i < level; i++) {
            const users = await USER.find(
                { Parent: { $in: invitationCodes } },
                { InvitationCode: 1 }
            );
            if (!users.length) return { valid: true, data: [] }; // If no users found at this level, return empty

            invitationCodes = users.map((user) => user.InvitationCode);
        }

        const details: TransactionObjType[] | null = await TRANSACTION.find(
            {
                Type,
                Parent: { $in: invitationCodes },
                Status: TransactionStatusType.SUCCESS,
                ...(tab === ActiveTabs.TODAY && {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                }),
            },
            {
                PhoneNumber: 1,
                createdAt: 1,
                Amount: 1,
                TransactionID: 1,
            }
        )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        if (!details) throw new Error("failed to get details");

        return {
            valid: true,
            data: JSON.parse(JSON.stringify(details)),
            pagination: {
                currentPage: page,
                level,
            },
        };
    } catch (error) {
        if (error instanceof Error)
            return { valid: false, msg: error.message, operation: "LOGOUT" };
        return { valid: false, msg: "Something went wrong." };
    }
};

// ===================================

// GET REGISTRATION DETAILS ===================================

export const getRegistrationDetails = async (
    tab: ActiveTabs,
    page: number = 1,
    level: number = 1
): ServiceReturnType<UserType[]> => {
    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        const userDetails: UserType | null = await USER.findOne({
            PhoneNumber: decoded.PhoneNumber,
        });

        if (!userDetails) throw new Error("Could not find the user");

        const pageSize = 10; // Number of records per page
        const skip = (page - 1) * pageSize;

        const startOfDay = DateTime.utc().startOf("day");
        const endOfDay = DateTime.utc().endOf("day");

        let invitationCodes = [userDetails.InvitationCode];

        // Recursively get users at the specified level
        for (let i = 1; i < level; i++) {
            const users = await USER.find(
                { Parent: { $in: invitationCodes } },
                { InvitationCode: 1 }
            );
            if (!users.length) return { valid: true, data: [] }; // If no users found at this level, return empty

            invitationCodes = users.map((user) => user.InvitationCode);
        }

        const details: UserType[] | null = await USER.find(
            {
                Parent: { $in: invitationCodes },
                ...(tab === ActiveTabs.TODAY && {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                }),
            },
            {
                PhoneNumber: 1,
                createdAt: 1,
                Balance: 1,
            }
        )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        if (!details) throw new Error("failed to get details");

        return {
            valid: true,
            data: JSON.parse(JSON.stringify(details)),
            pagination: {
                currentPage: page,
                level,
            },
        };
    } catch (error) {
        if (error instanceof Error)
            return { valid: false, msg: error.message, operation: "LOGOUT" };
        return { valid: false, msg: "Something went wrong." };
    }
};

// =======================================

// VIDEO WATCH / UPLOAD SECTION =================================

export const getWatchBonus = async (
    id: string
): ServiceReturnType<{ reward: number }> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        const startOfToday = DateTime.now().startOf("day");
        const endOfToday = DateTime.now().endOf("day");

        // check if already got bonus for today.
        const claimedToday = await VIDEO_EARNING.findOne({
            PhoneNumber: decoded.PhoneNumber,
            Type: VideoEarningType.WATCH,
            createdAt: {
                $gte: startOfToday,
                $lte: endOfToday,
            },
        });

        if (claimedToday)
            throw new Error("You have already claimed watch bonus today.");

        const dbUser = await USER.findOne({ PhoneNumber: decoded.PhoneNumber });
        if (!dbUser) throw new Error("NO user found");

        const video = await VIDEOS.findById(id);
        const reward = Number(video.DailyRates);

        await VIDEO_EARNING.create(
            [
                {
                    PhoneNumber: decoded.PhoneNumber,
                    InvitationCode: dbUser.InvitationCode,
                    Amount: Number(reward),
                    Video: new mongoose.Types.ObjectId(id),
                },
            ],
            { session }
        );

        // update users balance;
        await USER.findOneAndUpdate(
            { PhoneNumber: decoded.PhoneNumber },
            {
                $inc: { Balance: Number(reward), Profit: Number(reward) },
            },
            { session }
        );

        await session.commitTransaction();
        return {
            valid: true,
            msg: `Bonus Added INR ${reward} .`,
            data: { reward: Number(reward) },
        };
    } catch (error) {
        await session.abortTransaction();
        console.log(error);
        return {
            valid: false,
            msg:
                error instanceof Error ? error.message : "Something went wrong",
        };
    } finally {
        await session.endSession();
    }
};

export const uploadVideoForApproval = async (
    videoSrc: string
): ServiceReturnType => {
    try {
        if (videoSrc?.length < 5) throw new Error("Invalid source provided.");

        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        // check if this link already exists or not.
        const exists = await VIDEOS.findOne({ VideoSource: videoSrc });
        if (exists) throw new Error("This Link already exists.");

        const dbUser = await USER.findOne({ PhoneNumber: decoded.PhoneNumber });

        await VIDEOS.create([
            {
                PhoneNumber: decoded.PhoneNumber,
                InvitationCode: dbUser.InvitationCode,
                VideoSource: videoSrc,
                DailyRates: Number(Math.random() * (2 - 0.1) + 0.1).toFixed(2),
            },
        ]);

        return { valid: true, msg: "Video is under review." };
    } catch (error) {
        console.error(error);
        return {
            valid: false,
            msg:
                error instanceof Error
                    ? error.message
                    : "Something went wrong.",
        };
    }
};

export const getMyVideos = async (): ServiceReturnType<VideoType[]> => {
    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        const myVideos = (await VIDEOS.find({
            PhoneNumber: decoded.PhoneNumber,
        }).lean()) as unknown as VideoType[];
        if (!myVideos) throw new Error("Error..");
        return { valid: true, msg: "data", data: myVideos };
    } catch {
        return { valid: false, msg: "error" };
    }
};

export const getMyVideoEarnings = async (): ServiceReturnType<
    EarningType[]
> => {
    try {
        const cookie = await cookies();
        const token = cookie.get("token")?.value || "";

        const { success, decoded } = await VerifyToken(token);

        if (!success || !decoded) return { valid: false, operation: "LOGOUT" };

        await CONNECT();

        const videoEarnings = await VIDEO_EARNING.aggregate([
            {
                $match: {
                    PhoneNumber: decoded.PhoneNumber,
                },
            },
            {
                $facet: {
                    watchType: [
                        { $match: { Type: VideoEarningType.WATCH } },
                        {
                            $lookup: {
                                from: db_schema.VIDEOS,
                                localField: "Video",
                                foreignField: "_id",
                                as: "videoInfo",
                            },
                        },
                        { $unwind: "$videoInfo" },
                        {
                            $lookup: {
                                from: db_schema.USERS,
                                localField: "videoInfo.PhoneNumber",
                                foreignField: "PhoneNumber",
                                as: "autherInfo",
                            },
                        },
                        { $unwind: "$autherInfo" },
                        {
                            $project: {
                                Type: 1,
                                PhoneNumber: 1,
                                Amount: 1,
                                createdAt: 1,
                                Video: 1,
                                AutherPhoneNumber: "$autherInfo.PhoneNumber",
                                AutherName: "$autherInfo.Name",
                                VideoSource: "$videoInfo.VideoSource",
                            },
                        },
                    ],
                    uploadType: [
                        { $match: { Type: VideoEarningType.UPLOAD } },
                        {
                            $lookup: {
                                from: db_schema.VIDEOS,
                                localField: "Video",
                                foreignField: "_id",
                                as: "videoInfo",
                            },
                        },
                        { $unwind: "$videoInfo" },
                        {
                            $project: {
                                Type: 1,
                                PhoneNumber: 1,
                                Amount: 1,
                                createdAt: 1,
                                Video: 1,
                                VideoSource: "$videoInfo.VideoSource",
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    merged: {
                        $concatArrays: ["$watchType", "$uploadType"],
                    },
                },
            },
            { $unwind: "$merged" },
            { $replaceRoot: { newRoot: "$merged" } },
        ]);

        if (!videoEarnings) throw new Error("Error..");
        return { valid: true, msg: "data", data: videoEarnings };
    } catch {
        return { valid: false, msg: "error" };
    }
};

export const getAvailableVideosToWatch = async (): ServiceReturnType<
    VideoType[]
> => {
    try {
        await CONNECT();

        const videos = (await VIDEOS.find({
            ApprovalStatus: VideoApprovalStatusType.APPROVED,
            Vissibility: VideoVissibilityStatusType.VISSIBLE,
        }).lean()) as unknown as VideoType[];

        if (!videos) throw new Error("Error..");
        return {
            valid: true,
            msg: "data",
            data: JSON.parse(JSON.stringify(videos)),
        };
    } catch {
        return { valid: false, msg: "error" };
    }
};

export async function logoutAndRedirect() {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
        maxAge: 0,
        path: "/",
    });
}
