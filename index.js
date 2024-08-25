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

// CORS to update
let allowedOrigins = [
  'http://localhost:8080',
  'https://movies-app2024-74d588eb4f3d.herokuapp.com/',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application doesn’t allow access from origin ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// end of CORS

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth.js')(app);

// mongoose.connect('mongodb://localhost:27017/movieDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

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

// CREATE user
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
    // check the validation object for errors
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

// UPDATE user data
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await User.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
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

// Add a movie to a user's list of favorites
app.put(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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

// 8. DELETE favorite movie
app.delete(
  '/users/:id/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send('User not found');
      }

      res
        .status(200)
        .send(
          `Movie with ID ${req.params.MovieID} was removed from user's favorites.`
        );
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// Delete a user by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
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

// READ all movies
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

// Get a movie by title
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

// READ all genres
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

// READ data about a genre
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

// READ all directors
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

// READ data about a director by name
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

// Get a user by username
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

// READ all users
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

app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port' + port);
});
