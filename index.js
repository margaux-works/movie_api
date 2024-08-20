const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: 'Jodie',
    email: 'jodie66@gmail.com',
    favoriteMovies: ['Taxi Driver', 'Panic Room'],
  },
  {
    id: 2,
    name: 'Elliot',
    email: 'elliot_P@gmail.com',
    favoriteMovies: ['Juno'],
  },
];

let movies = [
  {
    Title: 'Titanic',
    Description:
      'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
    Genre: {
      Name: 'Drama',
      Description:
        'The drama genre is a broad category that features stories portraying human experiences, emotions, conflicts, and relationships in a realistic and emotionally impactful way.',
    },
    Director: {
      Name: 'James Cameron',
      Bio: 'James Francis Cameron was born on August 16, 1954 in Kapuskasing, Ontario, Canada. He moved to the United States in 1971. The son of an engineer, he majored in physics at California State University before switching to English, and eventually dropping out. He then drove a truck to support his screenwriting ambition.',
      Birth: 1954,
    },
    imgURL:
      'https://resizing.flixster.com/JBp0dumCJw-ln_HfI4rqvXOagG4=/206x305/v2/https://resizing.flixster.com/j1q6PHK0ZtbdABMQcflU-wH5-eE=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzL2Y1NGZmNWMyLTczMGUtNDViMS04NzdmLTRiODZiMDM0YWMwOS5qcGc=',
  },
  {
    Title: 'Moonlight',
    Description:
      'A young African-American man grapples with his identity and sexuality while experiencing the everyday struggles of childhood, adolescence, and burgeoning adulthood.',
    Genre: {
      Name: 'Drama',
      Description:
        'The drama genre is a broad category that features stories portraying human experiences, emotions, conflicts, and relationships in a realistic and emotionally impactful way.',
    },
    Director: {
      Name: 'Barry Jenkins',
      Bio: 'Barry Jenkins was born on 19 November 1979 in Miami, Florida, USA. He is a producer and director, known for If Beale Street Could Talk (2018), Moonlight (2016) and Aftersun (2022).',
      Birth: 1979,
    },
    imgURL:
      'https://resizing.flixster.com/JKC4UaZHymnUnqPbhWijwXeMaZk=/206x305/v2/https://resizing.flixster.com/HE1uYAymQPCdYxRQ4SQHAOmKE60=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzLzQ1MTIzMDlhLWJiMWUtNGVhOS05MjFhLTkyMjVmNDkzNDA5Yi53ZWJw',
  },
  {
    Title: 'The Mask',
    Description:
      'Bank clerk Stanley Ipkiss is transformed into a manic superhero when he wears a mysterious mask.',
    Genre: {
      Name: 'Comedy',
      Description:
        'The comedy genre refers to a category of entertainment that aims to amuse and entertain audiences by using humor, wit, and comedic situations.',
    },
    Director: {
      Name: 'Chuck Russell',
      Bio: 'Graduating from the University of Illinois, Russell left Chicago to begin work in film production in Los Angeles. He worked his way up, assistant directing and production managing independent films while writing screenplays.',
      Birth: 1958,
    },
    imgURL:
      'https://resizing.flixster.com/QaRTdvdYQrRFod-m17HTMGAfG64=/206x305/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p15854_p_v13_al.jpg',
  },

  {
    Title: 'Alien',
    Description:
      'After investigating a mysterious transmission of unknown origin, the crew of a commercial spacecraft encounters a deadly lifeform.',
    Genre: {
      Name: 'Sci-Fi',
      Description:
        'The sci-fi genre, short for science fiction, features imaginative and futuristic concepts that are often rooted in scientific principles, technology, and possibilities. ',
    },
    Director: {
      Name: 'Ridley Scott',
      Bio: 'Described by film producer Michael Deeley as "the very best eye in the business", director Ridley Scott was born on November 30, 1937 in South Shields, Tyne and Wear. His father was an officer in the Royal Engineers and the family followed him as his career posted him throughout the United Kingdom and Europe before they eventually returned to Teesside.',
      Birth: 1937,
    },
    imgURL:
      'https://resizing.flixster.com/5R4bkJZC-W_K-YjmIMKAXCbts5Y=/206x305/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p2571_p_v8_aw.jpg',
  },

  {
    Title: 'In the Mood for Love',
    Description:
      'Two neighbors form a strong bond after both suspect extramarital activities of their spouses. However, they agree to keep their bond platonic so as not to commit similar wrongs.',
    Genre: {
      Name: 'Dark Romance',
      Description:
        'The dark romance subgenre features themes of love, desire, and relationships within a context that is often intense, mysterious, and sometimes unsettling.',
    },
    Director: {
      Name: 'Wong Kar-Wai',
      Bio: 'Described by film producer Michael Deeley as "the very best eye in the business", director Ridley Scott was born on November 30, 1937 in South Shields, Tyne and Wear. His father was an officer in the Royal Engineers and the family followed him as his career posted him throughout the United Kingdom and Europe before they eventually returned to Teesside.',
      Birth: 1956,
    },
    imgURL:
      'https://resizing.flixster.com/ClQ3aL-8ksjZE_I_yKxX9kRjO7M=/206x305/v2/https://resizing.flixster.com/JiKhYY6ezF5gebJkR2gPLMBq3lI=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzLzQ5MGE5YWJlLTAzMzgtNGRmOC1iMWQ1LTlhZjFjYjg3MmY3ZS5qcGc=',
  },
];

// 5. CREATE user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('A name is required');
  }
});

// 6. UPDATE user data
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('This user does not exist');
  }
});

// 7. UPDATE new favorite movie
app.put('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    if (!user.favoriteMovies.includes(movieTitle)) {
      user.favoriteMovies.push(movieTitle);
      res
        .status(200)
        .send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
      res
        .status(400)
        .send("This movie is already in the user's favorites list.");
    }
  } else {
    res.status(400).send('This user does not exist');
  }
});

// 8. DELETE favorite movie
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('This user does not exist');
  }
});

// 9. DELETE user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(`User ${id} has been deleted`);
  } else {
    res.status(400).send('This user does not exist');
  }
});

// 1. READ all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// 2. READ data about a single movie
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);
  if (movie) {
    return res.status(200).json(movie);
  } else {
    res.status(400).send('This movie does not exist');
  }
});

// 3. READ data about a genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const movie = movies.find((movie) => movie.Genre.Name === genreName);
  if (movie) {
    return res.status(200).json(movie.Genre);
  } else {
    res.status(400).send('This genre does not exist');
  }
});

// 4. READ data about a director
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const movie = movies.find((movie) => movie.Director.Name === directorName);
  if (movie) {
    return res.status(200).json(movie.Director);
  } else {
    res.status(400).send('This genre does not exist');
  }
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
