import dotenv from "dotenv";
import connectdb from "./db/connectdb.js";
import app from "./app.js";

dotenv.config();

const startServer = async () => {
    try {
        await connectdb();

        app.get("/", (req, res) => {
            res.send("Alright");
        });

        const PORT = process.env.PORT || 8000;

        app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
