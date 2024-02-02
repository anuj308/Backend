import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

// console.log(process.env.MONGODBURL)
// console.log(process.env.PORT)
// console.log(DB_NAME)
const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`mongodb+srv://anujkumarsharma2023:mascssco@fastpy.qf9ces1.mongodb.net/${DB_NAME}`)
        console.log(`\n MongoDB connected DB host: ${connectionInstance.connection.host
        }`)
        console.log(process.env.MONGODBURL)
    } catch (error) {
        console.log("MONGODB connection error",error)
    }
}

export  default connectDB 