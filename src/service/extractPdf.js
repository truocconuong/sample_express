const { ExtractPdf } = require('../../models');

const insertExtractPdf = (data) => {
  const pdf = ExtractPdf.create(data);
  return pdf;
};

const getAllExtractNoProcess = () => ExtractPdf.findAll({
  where: {
    isRefine: false,
  },
});

const updateExtractPdf = async (id, data) => {
  const extractPdf = await ExtractPdf.findByPk(id);
  if (extractPdf) {
    await extractPdf.update(data);
  }
  return extractPdf;
};

module.exports = {
  insertExtractPdf,
  getAllExtractNoProcess,
  updateExtractPdf,
};
