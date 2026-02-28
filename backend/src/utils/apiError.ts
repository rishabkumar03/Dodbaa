class ApiError extends Error {
    statusCode: number
    errors: unknown[]
    data: null

    constructor(
        statusCode: number,          
        message: string = "Something went wrong",
        errors: unknown[] = [],       // 👈 default empty array so you don't always pass it
        stack: string = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.errors = errors
        this.data = null

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError