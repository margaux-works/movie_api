const express = require('express'),
  morgan = require('morgan');
const app = express();

let topMovies = [
  { title: 'Alien', author: 'Ridley Scott' },
  { title: 'The Shawshank Redemption', author: 'Frank Darabont' },
  { title: 'Little Miss Sunshine', author: 'Valerie Faris' },
  { title: 'Portrait of a Lady on Fire', author: 'Celine Sciamma' },
  { title: 'Forrest Gump', author: 'Robert Zemeckis' },
  { title: 'The Silence of the Lambs', author: 'Jonathan Demme' },
  { title: 'Parasite', author: 'Bong Joon Ho' },
  { title: 'Titanic', author: 'James Cameron' },
  { title: 'In The Mood for Love', author: 'Wong Kar-wai' },
  { title: 'Apocalypse Now', author: 'Francis Ford Coppola' },
  { title: 'Persepolis', author: 'Marjane Satrapi' },
];

app.use(morgan('combined'));

app.use(express.static('public'));

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/', (req, res) => {
  res.send('Welcome to my Movies app!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no :( Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
