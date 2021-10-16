const LocalStrategy = require('passport-local').Strategy;
const userService = require('../service/user');
const { compare } = require('../common/hash');
const util = require('../common/util');

module.exports = function (passport) {
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  }, (req, email, password, done) => {
    process.nextTick(async () => {
      try {
        const getUser = await userService.getUserByEmail(email);
        const user = getUser[0];
        if (!user) {
          const data = util.sendError(404, 'EMAIL_NOT_FOUND', 'email is not exist');
          return done(null, false, data);
        }
        const hashPassword = user.password;
        const variable = await compare(password, hashPassword);
        if (!variable) {
          const data = util.sendError(400, 'PASSWORD_INCORRECT', 'Your password is incorrect');
          return done(null, false, data);
        }
        if (user.isDelete) {
          const data = util.sendError(403, 'EMAIL_DENIED', 'email is denied');
          return done(null, false, data);
        }
        return done(null, user);
      } catch (e) {
        console.log(e);
        const data = util.sendError(400, 'PASSWORD_INCORRECT', 'Your password is incorrect');
        return done(null, false, data);
      }
    });
  }));
};
