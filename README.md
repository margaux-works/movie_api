# myFlix API

The **myFlix API** is a RESTful web service that provides access to a comprehensive database of movies, directors, and genres. It also includes user management features, allowing for user registration, profile updates, and management of favorite movies.

This API is used as the backend for the [myFlix-React](https://github.com/margaux-works/myFlix-React) and [myFlix-Angular](https://github.com/margaux-works/myFlix-Angular) front-end applications. These repositories provide user interfaces for interacting with the movie database.

## Features

- Movie Information
  - Retrieve details about all movies in the database.
  - Access specific information about movies, including genre and director details.
- User Management
  - User registration with secure password hashing.
  - Profile management, including the ability to update user information.
  - Add and remove movies from a user's list of favorites.
- Authentication and Authorization
  - Secure access to the API endpoints using JWT-based authentication.
  - Role-based access control to ensure users can only update or delete their own profiles.

## Tech Stack

- **Node.js**: Server-side runtime environment.
- **Express**: Web framework for building the API.
- **MongoDB**: NoSQL database for storing movie and user data.
- **Mongoose**: ODM for MongoDB, facilitating interaction between the API and the database.
- **Passport.js**: Authentication middleware for Node.js.
- **CORS**: Enabled to allow requests from all domains.

## Development Status

🚧 **This project is currently in development.** Key features have been implemented, and further enhancements are planned. Upcoming improvements may include: detailed error handling, input validation, and restricted allowed domains.

## API Endpoints

The following endpoints are available in the myFlix API (you can also see the details in my documentation):

**Movies**
- Get a list of all movies: GET /movies
- Get a single movie by title: GET /movies/:Title
- Get a genre by name: GET /movies/genres/:Name
- Get a director by name: GET /directors/:Name

**Users**
- Register a new user: POST /users
- Update user information: PUT /users/:Username
- Add a movie to a user's favorites: PUT /users/:Username/movies/:MovieID
- Remove a movie from a user's favorites: DELETE /users/:Username/movies/:MovieID
- Delete a user by username: DELETE /users/:Username
- Get user information by username: GET /users/:Username
- Get a list of all users: GET /users

**Directors and Genres**
- Get a list of all directors: GET /directors
- Get a list of all genres: GET /genres

Note: For secure endpoints, you must include a valid JWT token in the authorization header of your requests.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request.

## License

This project is licensed under the MIT License.
