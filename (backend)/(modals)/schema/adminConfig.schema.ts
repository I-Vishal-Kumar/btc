import { GatewayTypes, WithdrawalTypes, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";

const ADMIN_CONFIG_SCHEMA = new Schema({
    QrCode: String,

    HomePopImage: String,

    HistoryPopImage: String,

    Password: { type: String, default: "__998*855__" },

    UpiIds: Array,

    HomePageCarousel: Array,

    HomePageImg: String,

    AvailableVideos: Array,

    Gateway: {
        type: String,
        enum: Object.values(GatewayTypes),
        default: GatewayTypes.DEFAULT,
    },

    Usdt: { type: Boolean, default: false },
    
    AutoWithdraw: {
        type: String,
        enum: Object.values(WithdrawalTypes),
        default: WithdrawalTypes.DEFAULT,
    },

    UsdtAddress: {
        type: String,
        default: "TLNpPzXAMhW1rh32TddcRJDhPj5EeD2gH7",
    },
});

export const ADMIN_CONFIG =
    models?.[db_schema.ADMIN_CONFIG] ||
    model(db_schema.ADMIN_CONFIG, ADMIN_CONFIG_SCHEMA);
