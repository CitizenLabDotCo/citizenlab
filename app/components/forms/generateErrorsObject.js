const generateErrorsObject = (e) => {
  const errorsObje = {};
  // translate Errors to arrays snake case strings
  Object.keys(e).forEach((type) => {
    errorsObje[type] = e[type].map(
      (ele) => `${type}_error_${ele.error}`
    );
  });
  return errorsObje;
};

export default generateErrorsObject;
