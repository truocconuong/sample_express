const bankrecruiterService = require('../service/bankrecruiter');
const util = require('../common/util');

async function uploadDriver(req, res) {
  const URL = 'https://drive.google.com/file/d/';
  res.send(util.sendSuccess({ link: URL }));
}

async function postNewBankRecruiter(req, res) {
  try {
    let data = req.body;
    let bankNumber = data.bankNumber.trim();
    let bankRecruiter = await bankrecruiterService.getBankRecruiterByBankNumber(
      bankNumber,
    );
    data.recruiterId = req.userId;

    if (bankRecruiter) {
      return res.send(util.sendError(400, 'Bank Number Is Unique'));
    }
    await bankrecruiterService.postNewBankRecruiter(data);
    return res.send(util.sendSuccess({ id: data.id }));
  } catch (error) {
    return res.send(
      util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, error),
    );
  }
}

async function getAllBankRecruiter(req, res) {
  try {
    const bankRecruiter = await bankrecruiterService.getAllBankRecruiter();
    return res.send(util.sendSuccess({ bankRecruiter }));
  } catch (error) {
    return res.send(
      util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, error),
    );
  }
}

async function getBankRecruiterByRecruiterId(req, res) {
  try {
    let recuriterId = req.params.recruiterId;
    const bankRecruiter = await bankrecruiterService.getBankRecruiterByRecruiterId(
      recuriterId,
    );
    if (!bankRecruiter) {
      return res.send(util.sendError(400, 'Recruiter Not Found !!!'));
    }
    return res.send(util.sendSuccess({ data: bankRecruiter }));
  } catch (error) {
    return res.send(
      util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, error),
    );
  }
}

async function updateBankRecruiterByUserId(req, res) {
  try {
    let { userId } = req.params;
    const data = req.body;

    const bankRecruiter = await bankrecruiterService.updateBankRecruiterByUserId(
      userId, data,
    );
    if (!bankRecruiter) {
      return res.send(util.sendError(400, 'Bank Recruiter Not Found'));
    }
    return res.send(util.sendSuccess({ userId: bankRecruiter.id }));
  } catch (error) {
    return res.send(
      util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, error),
    );
  }
}

async function deleteBankRecruiterByUserId(req, res) {
  try {
    let { recruiterId } = req.params;
    const bankRecruiter = await bankrecruiterService.deleteBankRecruiterByUserId(recruiterId);
    if (!bankRecruiter) {
      return res.send(util.sendError(400, 'Bank Recruiter Not Found'));
    }
    return res.send(util.sendSuccess({ recruiterId }));
  } catch (error) {
    return res.send(
      util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, error),
    );
  }
}

module.exports = {
  uploadDriver,
  getAllBankRecruiter,
  postNewBankRecruiter,
  getBankRecruiterByRecruiterId,
  updateBankRecruiterByUserId,
  deleteBankRecruiterByUserId,
};
