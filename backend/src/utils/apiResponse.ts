type ApiResponseData<T> = {
    statusCode: number
    data: T
    message: string
    success: boolean
}

class ApiResponse<T> implements ApiResponseData<T> {
    statusCode: number
    data: T
    message: string
    success: boolean
    
    constructor(statusCode: number, data: T, message: string = "success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export default ApiResponse