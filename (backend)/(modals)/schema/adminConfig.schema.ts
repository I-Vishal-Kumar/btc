import { GatewayTypes, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";



const ADMIN_CONFIG_SCHEMA = new Schema({
    
    QrCode          : String,

    Password        : {type: String, default: '__998*855__'},
    
    UpiIds          : Array,
    
    Gateway         : {enum: Object.values(GatewayTypes), default: GatewayTypes.DEFAULT},
    
   });

export const ADMIN_CONFIG = models?.[db_schema.ADMIN_CONFIG] || model(db_schema.ADMIN_CONFIG, ADMIN_CONFIG_SCHEMA)