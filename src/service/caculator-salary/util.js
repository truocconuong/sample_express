const SELF = 11000000;
const NET_TO_GROSS = 1;
const REDUCE_DEPENDENT = 4400000;
function fixedNumber(number) {
  return Number(Number(number.toFixed(0)));
}
function socialInsurance(salary, percent) {
  const result = salary < 29800000 ? salary * (percent / 100) : 29800000 * (percent / 100);
  return fixedNumber(result);
}

function healthInsurance(salary, percent) {
  const result = salary < 29800000 ? salary * (percent / 100) : 29800000 * (percent / 100);
  return fixedNumber(result);
}

function unemployedInsurance(salary, percent) {
  const result = salary * (percent / 100);
  return fixedNumber(result);
}

function unionTax(salary, percent) {
  const result = salary < 29800000 ? salary * (percent / 100) : 29800000 * (percent / 100);
  return fixedNumber(result);
}

function actualSalary(salary, workingDay) {
  const result = (salary * workingDay) / 23;
  return fixedNumber(result);
}

function personalIncomeTax(taxableIncome) {
  let result = 0;
  if (taxableIncome > 0) {
    result = taxableIncome * (5.0 / 100);
  }
  if (taxableIncome > 5000000) {
    result = taxableIncome * (10.0 / 100) - 250000;
  }
  if (taxableIncome > 10000000) {
    result = taxableIncome * (15.0 / 100) - 750000;
  }
  if (taxableIncome > 18000000) {
    result = taxableIncome * (20.0 / 100) - 1650000;
  }

  if (taxableIncome > 32000000) {
    result = taxableIncome * (25.0 / 100) - 3250000;
  }
  if (taxableIncome > 52000000) {
    result = taxableIncome * (30.0 / 100) - 5850000;
  }
  if (taxableIncome > 80000000) {
    result = taxableIncome * (35.0 / 100 - 9850000);
  }
  return fixedNumber(result);
}

function caculatorTax(taxIncome) {
  let result = 0;
  if (taxIncome > 61850000) {
    result = (taxIncome - 9850000) / 0.65;
  } else if (taxIncome > 42250000) {
    result = (taxIncome - 5850000) / 0.7;
  } else if (taxIncome > 27250000) {
    result = (taxIncome - 3250000) / 0.75;
  } else if (taxIncome > 16050000) {
    result = (taxIncome - 1650000) / 0.8;
  } else if (taxIncome > 9250000) {
    result = (taxIncome - 750000) / 0.85;
  } else if (taxIncome > 4750000) {
    result = (taxIncome - 250000) / 0.9;
  }
  if (result === 0) {
    result = taxIncome / 0.95;
  }
  return fixedNumber(result);
}

function caculatorGross(salaryNet) {
  return Number(
    Number(salaryNet / (1 - 8.0 / 100 - 1.5 / 100 - 1.0 / 100)).toFixed(0),
  );
}

function convertSalaryNetToGross(salary, peopleDependent) {
  const nguoiPhuThuoc = REDUCE_DEPENDENT * peopleDependent;
  const thuNhapThue = salary - SELF - nguoiPhuThuoc;
  const taxes = caculatorTax(thuNhapThue);
  const taxPersonal = personalIncomeTax(taxes);
  const salaryNet = salary + taxPersonal;
  const grossNotTax = caculatorGross(salaryNet);
  const bhxhNet = socialInsurance(grossNotTax, 8.0);
  const bhytNet = healthInsurance(grossNotTax, 1.5);
  const bhtnNet = unemployedInsurance(grossNotTax, 1);
  return salary + bhxhNet + bhytNet + bhtnNet + taxPersonal;
}

function convertVND(number) {
  return number.toLocaleString('it-IT');
}

function detailPersonalTax(taxesGross, taxPersonal) {
  try {
    const objectTax = {
      percent5: 0,
      percent10: 0,
      percent15: 0,
      percent20: 0,
      percent25: 0,
      percent30: 0,
      percent35: 0,
    };
    let swapGross = 0;
    if (taxesGross > 0) {
      objectTax.percent5 = taxesGross < 5000000 ? taxesGross * (5.0 / 100) : 5000000 * (5.0 / 100);
    }
    if (taxesGross > 5000000) {
      swapGross = taxesGross > 10000000 ? 10000000 : taxesGross;
      objectTax.percent10 = fixedNumber((swapGross - 5000000) * (10.0 / 100));
    }
    if (taxesGross > 10000000) {
      swapGross = taxesGross > 18000000 ? 18000000 : taxesGross;
      objectTax.percent15 = fixedNumber((swapGross - 10000000) * (15 / 100));
    }
    if (taxesGross > 18000000) {
      swapGross = taxesGross > 32000000 ? 32000000 : taxesGross;
      objectTax.percent20 = fixedNumber((swapGross - 18000000) * (20 / 100));
    }
    if (taxesGross > 32000000) {
      swapGross = taxesGross > 52000000 ? 52000000 : taxesGross;
      objectTax.percent25 = fixedNumber((swapGross - 32000000) * (25 / 100));
    }
    if (taxesGross > 52000000) {
      swapGross = taxesGross > 80000000 ? 80000000 : taxesGross;
      objectTax.percent30 = fixedNumber((swapGross - 52000000) * (30 / 100));
    }
    if (taxesGross > 80000000) {
      objectTax.percent35 = fixedNumber(
        taxPersonal
        - objectTax.percent5
        - objectTax.percent10
        - objectTax.percent15
        - objectTax.percent20
        - objectTax.percent25
        - objectTax.percent30,
      );
    }
    return objectTax;
  } catch (error) {
    return error;
  }
}

function caculator(data) {
  let {
    salary, pvi, insuraneMoney, type, peopleDependent,
  } = data;
  const workingDay = 23;
  let gross = salary;
  if (type === NET_TO_GROSS) {
    // caculator salary to gross;
    gross = convertSalaryNetToGross(insuraneMoney, peopleDependent);
    insuraneMoney = convertSalaryNetToGross(insuraneMoney, peopleDependent);
  }
  const companyBhxh = socialInsurance(insuraneMoney, 17.5);
  const companyBhyt = healthInsurance(insuraneMoney, 3);
  const companyBhtn = unemployedInsurance(insuraneMoney, 1);
  const thueCongDoan = unionTax(insuraneMoney, 2);
  const luongThucTe = actualSalary(insuraneMoney, workingDay);
  const tongChiPhi = fixedNumber(
    companyBhxh + companyBhyt + companyBhtn + thueCongDoan + luongThucTe + pvi,
  );
  const bhxh = socialInsurance(insuraneMoney, 8);
  const bhyt = healthInsurance(insuraneMoney, 1.5);
  const bhtn = unemployedInsurance(insuraneMoney, 1);
  const thuNhapChiuThue = luongThucTe - (SELF + bhxh + bhyt + bhtn) <= 0
    ? 0
    : fixedNumber(luongThucTe - (SELF + bhxh + bhyt + bhtn));
  // manh test
  const tncn = personalIncomeTax(thuNhapChiuThue);
  const bank = luongThucTe - tncn - bhxh - bhyt - bhtn;

  const detailPrecentPersonal = detailPersonalTax(thuNhapChiuThue, tncn);
  let result = {
    ...detailPrecentPersonal,
    gross,
    bhxh,
    bhyt,
    bhtn,
    tnct: thuNhapChiuThue,
    tncn,
    net: bank,
    companyBhxh,
    companyBhyt,
    companyBhtn,
    pvi,
    unionTax: thueCongDoan,
    total: tongChiPhi,
    SGD: fixedNumber(tongChiPhi / 16400),
  };

  Object.keys(result).forEach((key) => {
    result[key] = convertVND(result[key]);
  });
  return result;
}

module.exports = caculator;
