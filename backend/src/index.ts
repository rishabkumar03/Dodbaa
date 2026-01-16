import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.get("/home", (req, res) => {
    res.send("Alright")
})

app.listen(process.env.PORT, () => {
    console.log("app is listening on 8000");
    
})