/**
 * This is the main entry file for the MyFlix API.
 * It sets up the server, connects to MongoDB, and configures routes for user and movie data.
 * @file index.js
 */

const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  cors = require('cors');
const { Movie, User, Genre, Director } = require('./models');
const passport = require('passport');
require('./passport.js');
const app = express();
const { check, validationResult } = require('express-validator');

// restricted origins
// let allowedOrigins = [
//   'http://localhost:8080',
//   'http://localhost:1234',
//   'https://movies-app2024-74d588eb4f3d.herokuapp.com',
//   'https://margauxflix.netlify.app',
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         let message =
//           'The CORS policy for this application doesn’t allow access from origin ' +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

app.use(cors()); // Allows requests from all origins

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth.js')(app);

/**
 * Middleware: Connects to MongoDB database.
 * Logs messages to the console for connection status.
 */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to movieDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

/**
 * allow a new user to register
 * @route POST /users
 * @description Register a new user.
 * @param {string} Username - Username (min. 5 characters, alphanumeric).
 * @param {string} Password - Password (hashed).
 * @param {string} Email - User's email (valid format).
 * @param {Date} Birthday - User's birthday (optional).
 * @returns {object} The newly created user object or error message.
 */

app.post(
  '/users',
  // Validation logic here for request
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // validation logic
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = User.hashPassword(req.body.Password);
    await User.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          User.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

/**
 * allow user to update their data
 * @route PUT /users/:Username
 * @description Update user data by username.
 * @param {string} Username - New username (optional).
 * @param {string} Password - New password (optional, hashed).
 * @param {string} Email - New email address (optional).
 * @param {Date} Birthday - New birthday (optional).
 * @returns {object} Updated user data or error message.
 */
app.put(
  '/users/:Username',

  [
    check('Username', 'Username must be at least 5 characters long')
      .optional()
      .isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non-alphanumeric characters - not allowed.'
    )
      .optional()
      .isAlphanumeric(),
    check('Password', 'Password is required').optional().not().isEmpty(),
    check('Email', 'Email does not appear to be valid').optional().isEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // Validation
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const updateData = {};
    if (req.body.Username) updateData.Username = req.body.Username;
    if (req.body.Email) updateData.Email = req.body.Email;
    if (req.body.Birthday) updateData.Birthday = req.body.Birthday;
    if (req.body.Password)
      updateData.Password = User.hashPassword(req.body.Password);

    await User.findOneAndUpdate(
      { Username: req.params.Username },
      { $set: updateData },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * allow user to add a movie to their favorites
 * @route PUT /users/:Username/movies/:MovieID
 * @description Adds a movie to a user's list of favorites.
 * @param {string} Username - User's username.
 * @param {string} MovieID - ID of the movie to add.
 * @returns {object} Updated user data or error message.
 */
app.put(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // Check if user exists
    const user = await User.findOne({ Username: req.params.Username });
    if (!user) return res.status(404).send('User not found');

    // Check if the movie is already a favorite
    if (user.FavoriteMovies.includes(req.params.MovieID)) {
      return res.status(400).send('Movie is already in favorites');
    }

    await User.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * allow a user to delete a movie from their favorites
 * @route DELETE /users/:Username/movies/:MovieID
 * @description Removes a movie from a user's list of favorites.
 * @param {string} Username - User's username.
 * @param {string} MovieID - ID of the movie to remove.
 * @returns {object} Updated user data or error message.
 */

app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send('User not found');
      }

      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

/**
 * allow a user to delete their account
 * @route DELETE /users/:Username
 * @description Delete a user by username.
 * @param {string} Username - Username of the user to delete.
 * @returns {string} Success or error message.
 */

app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    await User.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * allow user to see a list of movies
 * @route GET /movies
 * @description Get a list of all movies.
 * @returns {object[]} Array of movie objects or error message.
 */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movie.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /movies/:Title
 * @description Get a movie by title.
 * @param {string} Title - The title of the movie to retrieve.
 * @returns {object} The movie object matching the title or error message.
 */
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movie.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /:MovieID
 * @description Get a movie by ID.
 * @param {string} MovieID - The ID of the movie to retrieve.
 * @returns {object} The movie object matching the ID or error message.
 */
app.get(
  '/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movie.findOne({ _id: req.params.MovieID })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /genres
 * @description Get a list of all genres.
 * @returns {object[]} Array of genre objects or error message.
 */
app.get(
  '/genres',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Genre.find()
      .then((genres) => {
        res.status(200).json(genres);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /movies/genres/:Name
 * @description Get data about a genre by name.
 * @param {string} Name - The name of the genre to retrieve.
 * @returns {object} The genre object matching the name or error message.
 */
app.get(
  '/movies/genres/:Name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Genre.findOne({ Name: req.params.Name })
      .then((genre) => {
        res.json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /directors
 * @description Get a list of all directors.
 * @returns {object[]} Array of director objects or error message.
 */
app.get(
  '/directors',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Director.find()
      .then((directors) => {
        res.status(200).json(directors);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /directors/:Name
 * @description Get data about a director by name.
 * @param {string} Name - The name of the director to retrieve.
 * @returns {object} The director object matching the name or error message.
 */
app.get(
  '/directors/:Name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Director.findOne({ Name: req.params.Name })
      .then((director) => {
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /users/:Username
 * @description Get a user by username.
 * @param {string} Username - The username of the user to retrieve.
 * @returns {object} The user object or error message.
 */
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await User.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /users
 * @description Get a list of all users.
 * @returns {object[]} Array of user objects or error message.
 */
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @route GET /
 * @description Welcome route for the MyFlix API.
 * @returns {string} Welcome message.
 */
app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port' + port);
});
