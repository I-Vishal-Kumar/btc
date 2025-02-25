import { GatewayTypes } from "./db.types"

export type AdminConfigType = {
    QrCode  : String,
    UpiIds  : String[],
    Gateway : GatewayTypes
}