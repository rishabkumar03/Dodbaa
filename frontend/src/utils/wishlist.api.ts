import api from "./api"

export const addToWishlist = (productId: string) => 
    api.post("/api/v1/wishlist/add", { productId })

export const removeFromWishlist = (productId: string) => 
    api.delete(`/api/v1/wishlist/remove/${productId}`)

export const getUserWishlist = (page = 1, limit = 10) => 
    api.get(`/api/v1/wishlist?pages=${page}&limit=${limit}`)

export const getWishlistCount = () =>
    api.get("/api/v1/wishlist/count")