const { BankRecruiter } = require('../../models');

async function postNewBankRecruiter(data) {
  const bankRecruiter = await BankRecruiter.create({
    bankNumber: data.bankNumber,
    name: data.name,
    bankName: data.bankName,
    recruiterId: data.recruiterId,
    urlFrontImageIdCard: data.urlFrontImageIdCard,
    urlBehindImageIdCard: data.urlBehindImageIdCard,
  });
  return bankRecruiter;
}

async function getAllBankRecruiter() {
  const bankRecruiter = await BankRecruiter.findAll();
  return bankRecruiter;
}

async function getBankRecruiterByBankNumber(bankNumber) {
  const bankRecruiter = await BankRecruiter.findOne({
    where: {
      bankNumber,
    },
  });
  if (!bankRecruiter) {
    return false;
  }
  return bankRecruiter;
}

async function getBankRecruiterByRecruiterId(recruiterId) {
  const bankRecruiter = await BankRecruiter.findOne({
    where: {
      recruiterId,
    },
  });
  if (!bankRecruiter) {
    return false;
  }
  return bankRecruiter;
}

async function updateBankRecruiterByUserId(userId, data) {
  const bankRecruiter = await BankRecruiter.findOne({
    where: {
      recruiterId: userId,
    },
  });
  console.log(bankRecruiter);
  if (bankRecruiter) {
    await bankRecruiter.update(data);
  }
  return bankRecruiter;
}

async function deleteBankRecruiterByUserId(recruiterId) {
  const bankRecruiter = await BankRecruiter.findOne({
    where: {
      recruiterId,
    },
  });
  if (!bankRecruiter) {
    return false;
  }
  await bankRecruiter.destroy();
  return bankRecruiter;
}

async function getBankRecruiterById(id) {
  const bankRecruiter = await BankRecruiter.findOne({
    where: {
      id,
    },
  });
  if (!bankRecruiter) {
    return false;
  }
  return bankRecruiter;
}

module.exports = {
  postNewBankRecruiter,
  getBankRecruiterByBankNumber,
  getBankRecruiterByRecruiterId,
  updateBankRecruiterByUserId,
  deleteBankRecruiterByUserId,
  getAllBankRecruiter,
  getBankRecruiterById,
};
