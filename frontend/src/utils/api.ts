import axios from "axios"

interface ImportMetaEnv {
    readonly VITE_API_URL?: string
}

declare global {
    interface ImportMeta {
        readonly env: ImportMetaEnv
    }
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// axios instance with all config
const api = axios.create({
    baseURL: BASE_URL,

    // sends cookies automatically (for JWT)
    withCredentials: true,

    headers: {
        "Content-Type": "application/json"
    }
})

// Request interceptor - auto attack accessToken to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken")

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// Response interceptor - auto handle token expire
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and not already retried leads to refreshToken
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {

                // Try to refresh the access token
                const { data } = await axios.post(
                    `${BASE_URL}/api/v1/users/refresh-token`,
                    {},
                    { withCredentials: true }
                )

                // Save new access token
                localStorage.setItem("accessToken", data.data.accessToken)

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
                return api(originalRequest)

            } catch (refreshError) {

                // Refresh failed, it means logout user
                localStorage.removeItem("accessToken")
                window.location.href = "/login"
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api