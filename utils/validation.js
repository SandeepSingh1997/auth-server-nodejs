const isNameValid = (name) => {
  if (name && name.search(/^[a-z A-Z]{5,30}$/) !== -1) {
    return true;
  } else {
    return false;
  }
};

const isEmailValid = (email) => {
  const validAtTheRate = /^[^@]+@[^@]+$/;
  if (email && email.length < 40 && email.search(validAtTheRate) !== -1) {
    return true;
  } else {
    console.log("email  error");
    return false;
  }
};

const isPasswordValid = (password) => {
  const atLeastOnedigit = /\d+?/;
  const atLeastOneCapCase = /[A-Z]+?/;
  const atLeastOneSmallCase = /[a-z]+?/;
  const atLeastOneSpecialChar = /[!@#$%^&*)(+=._-]+?/;
  if (
    password &&
    password.length > 8 &&
    password.search(atLeastOnedigit) !== -1 &&
    password.search(atLeastOneCapCase) !== -1 &&
    password.search(atLeastOneSmallCase) !== -1 &&
    password.search(atLeastOneSpecialChar) !== -1
  ) {
    return true;
  } else {
    console.log(" password error");
    return false;
  }
};

exports.isNameValid = isNameValid;
exports.isEmailValid = isEmailValid;
exports.isPasswordValid = isPasswordValid;
