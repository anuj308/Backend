const asyncHandler = (requestHandler) => {
  (res, req, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler }; 

// const asyncHandler = (fn) => { () => {} } //same function inside function
// const asyncHandler = (fn) => () => {}
// const asyncHandler = (fn) => async() => {}

// const asyncHandler = (fnc) => async (res, req, next) => {
//   try {
// await fnc(req,res,next)
//   } catch (error) {
//     res.send(err.code || 500).json({
//       sucess: false,
//       message: err.message,
//     });
//   }
// };
