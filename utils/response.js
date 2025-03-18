const successResponse = (data, message = 'Success') => {
    return {
      success: true,
      message,
      data,
    };
  };
  
  const errorResponse = (message = 'Error') => {
    return {
      success: false,
      message,
    };
  };
  
  module.exports = { successResponse, errorResponse };