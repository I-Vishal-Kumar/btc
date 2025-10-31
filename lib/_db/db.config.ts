import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGO_URI!;

// if (!MONGODB_URI) {
//     console.log({MONGODB_URI});
//   throw new Error("uri not defined");
// }

let CACHED_CONNECTION : Mongoose | null = null;

export const CONNECT = async () => {

    // check for existing connection
    if (CACHED_CONNECTION) return  CACHED_CONNECTION;

    try {
        // create a new connection.
        CACHED_CONNECTION = await mongoose.connect(MONGODB_URI)
        console.log('connected')
        return CACHED_CONNECTION;

    } catch (error) {
        console.log({
            error : error,
            message : "Error connecting to MongoDB"
        });
        throw new Error('Error while connection')
    }
}
