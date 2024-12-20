/**
 * @constant {string} jwtSecret - Secret key for JWT signing.
 */
const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport');

/**
 * Generates a JWT token for a given user.
 *
 * @function generateJWTToken
 * @param {Object} user - The user object to generate a token for.
 * @returns {string} - The signed JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

/**
 * Configures the router to handle user login and token generation.
 *
 * @function
 * @param {object} router - The router object to add the login route to.
 * @returns {void}
 *
 * @description
 * Defines a POST endpoint at /login that authenticates a user using Passport's Local strategy.
 * If authentication is successful, a JWT token is generated and returned with the user object.
 * If authentication fails, an error message is returned.
 */

module.exports = (router) => {
  /**
   * POST endpoint to log in a user.
   *
   * @name POST /login
   * @function
   * @memberof module:auth
   * @inner
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   *
   * @description
   * Authenticates a user and, if successful, generates a JWT token.
   * Uses Passport's Local strategy without sessions. If the user
   * credentials are valid, a JWT is returned; otherwise, a 400 status
   * and error message are sent.
   */
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
