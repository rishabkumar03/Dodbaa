import mongoose from "mongoose"


let connectiondb: any;

export default connectiondb = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!)
        console.log("Connected");
    } catch (error) {
        console.log("Not connected");
    }
};