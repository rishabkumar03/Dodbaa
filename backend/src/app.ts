import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,    
    credentials: true
}))

app.use(express.json({limit: "15kb"}))

// extended: true allows nested objects
app.use(express.urlencoded({extended: true, limit: "15kb"}))
app.use(express.static("public"))

// cookie parser is used to access cookies from user server
app.use(cookieParser())

// ------- routes import -------
import userRouter from './routes/user.routes.js'
import artistRouter from './routes/artistProfile.routes.js'

// ------- routes declaration -------
app.use("/api/v1/users", userRouter)
app.use("/api/v1/artists", artistRouter)

// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/artists/apply-artist

export default app;