class apiError extends Error {
    constructor(
        statusCode,
        massage="somthing went wrong",
        errors=[],
        stack=[]
        
    ){
        super(massage)
        this.statusCode=statusCode
        this.data=null
        this.message=massage
        this.success=false
        this.errors=errors

        if (stack) {
            this.stack=stack
        } else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export { apiError }