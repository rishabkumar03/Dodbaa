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
import addressRouter from './routes/address.routes.js'
import categoryRouter from './routes/category.routes.js'
import couponRouter from './routes/coupon.routes.js'
import cartRouter from './routes/cart.routes.js'
import productRouter from './routes/product.routes.js'

// ------- routes declaration -------
app.use("/api/v1/users", userRouter)
app.use("/api/v1/artists", artistRouter)
app.use("/api/v1/address", addressRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/coupon", couponRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/products", productRouter)

// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/artists/apply-artist
// http://localhost:8000/api/v1/address/
// http://localhost:8000/api/v1/category/
// http://localhost:8000/api/v1/coupon/
// http://localhost:8000/api/v1/cart/
// http://localhost:8000/api/v1/products/

export default app;