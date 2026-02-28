class ApiError extends Error {
    statusCode!: number;
    errors!: unknown[]
    data!: null;

    constructor(
        statusCode: number,
        message:  string = "Something went wrong",
        errors = [],
        stack: string
    ) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

        console.log("Error Message in ErrorHandling", statusCode, this.data, message);

    }
}

export default ApiError