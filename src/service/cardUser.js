const { CardUser } = require('../../models');

async function deleteCardUserByCardId(cardId) {
  try {
    await CardUser.destroy({
      where: {
        cardId,
      },
    });
    return true;
  } catch (error) {
    console.log('err while delete card user', error);
    return false;
  }
}

module.exports = {
  deleteCardUserByCardId,
};
