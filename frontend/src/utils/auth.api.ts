import api from "./api"

export const loginUser = (data: {
    email?: string,
    phone?: string,
    password: string
}) => 
    api.post("/api/v1/users/login", data)

export const registerUser = (data: FormData) => 
    api.post("/api/v1/users/register", data)

export const logoutUser = () => 
    api.post("/api/v1/users/logout")

export const getCurrentUser = () => 
    api.get("/api/v1/users/current-user")