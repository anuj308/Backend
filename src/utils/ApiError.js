class ApiError extends Error {
  constructor(
    statusCode,
    meassage = "something went wrong",
    errors = [],
    statck = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = meassage;
    this.success= false;
    this.errors= errors;

    if(stack){
        this.stack = statck
    }else{
        Error.captureStackTrace(this,this.construtor)
    }
  }
}

export {ApiError}