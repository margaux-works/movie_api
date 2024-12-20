const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

/**
 * Movie schema for storing movie details in the database.
 *
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {string} Description - A short description of the movie.
 * @property {Object} Genre - The genre of the movie.
 * @property {string} Genre.Name - Name of the genre (e.g., Comedy, Drama).
 * @property {string} Genre.Description - Description of the genre.
 * @property {Object} Director - The director of the movie.
 * @property {string} Director.Name - Director's name.
 * @property {string} Director.Bio - Director's biography.
 * @property {string} Director.Birth - Director's birth date.
 * @property {string} [Director.Date] - Director's date of death (if applicable).
 * @property {string} ImagePath - Path or URL to the movie's image.
 * @property {string[]} Actors - List of actors in the movie.
 * @property {boolean} Featured - Whether the movie is featured.
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: { type: String, required: true },
    Description: { type: String, required: true },
  },
  Director: {
    Name: { type: String, required: true },
    Bio: { type: String, required: true },
    Birth: { type: String, required: true },
    Date: { type: String },
  },
  ImagePath: { type: String, required: true },
  Actors: [String],
  Featured: Boolean,
});

/**
 * User schema for storing user details and preferences in the database.
 *
 * @typedef {Object} User
 * @property {string} Username - The username of the user.
 * @property {string} Password - The hashed password of the user.
 * @property {string} Email - The user's email address.
 * @property {Date} [Birthday] - The user's birth date.
 * @property {mongoose.Schema.Types.ObjectId[]} FavoriteMovies - Array of favorite movies' IDs.
 */
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

/**
 * Hashes a user’s password using bcrypt.
 *
 * @function hashPassword
 * @memberof User
 * @param {string} password - The plain text password to hash.
 * @returns {string} - The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Validates a user’s password by comparing it with the stored hashed password.
 *
 * @function validatePassword
 * @memberof User
 * @param {string} password - The plain text password to validate.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// let genreSchema = mongoose.Schema({
//   Name: { type: String, required: true },
//   Description: { type: String, required: true },
// });

// let directorSchema = mongoose.Schema({
//   Name: { type: String, required: true },
//   Bio: { type: String, required: true },
//   Birthday: Date,
//   DateOfDeath: Date,
// });

// Models for Movie and User schemas.
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
// let Genre = mongoose.model('Genre', genreSchema);
// let Director = mongoose.model('Director', directorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
// module.exports.Genre = Genre;
// module.exports.Director = Director;
