const validateEmail = (email) => {
  // eslint-disable-next-line no-useless-escape
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const checkEmail = (email) => {
  if (email === '') {
    return false;
  } if (validateEmail(email) !== true) {
    return false;
  }
  return true;
};

const checkPhone = (phoneNumber) => {
  if (phoneNumber === '') {
    return false;
  } if (!phoneNumber.startsWith('0')) {
    return false;
  } if (phoneNumber.length > 12 || phoneNumber.length < 7) {
    return false;
  }
  return true;
};

module.exports = {
  checkEmail,
  checkPhone,
};
