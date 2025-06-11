import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
       const cannectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`DB conected at ${cannectionInstance.connection.host}`);
       
    } catch (error) {
        console.log("mongoDB cannection failede" , error);
        process.exit(1);
    }
}

export default connectDB