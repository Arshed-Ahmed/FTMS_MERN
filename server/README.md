# FTMS Server (Backend)

The backend API for the Fashion Tailoring Management System, built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs (hashing), cors (Cross-Origin Resource Sharing)

## Project Structure

- `controllers/`: Logic for handling API requests.
- `models/`: Mongoose schemas for database entities (User, Order, Customer, etc.).
- `routes/`: API route definitions.
- `middleware/`: Custom middleware (auth, error handling).
- `config/`: Database connection configuration.
- `utils/`: Helper functions.

## API Endpoints

The API is prefixed with `/api`.

### Authentication

- `POST /api/users/login`: Authenticate user and get token.

### Resources

- `/api/users`: User management.
- `/api/customers`: Customer CRUD.
- `/api/orders`: Order processing.
- `/api/employees`: Employee management.
- `/api/materials`: Inventory items.
- `/api/jobs`: Job card assignments.
- `/api/styles`: Style gallery items.
- `/api/measurements`: Customer measurements.
- `/api/itemtypes`: Measurement templates.
- `/api/company`: Company settings.

## Setup & Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in the root of the `server` directory:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ftms
   JWT_SECRET=your_jwt_secret
   ```

3. Run the server:

   ```bash
   npm run dev
   ```

   (Requires `nodemon` installed globally or as a dev dependency).

## Maintenance

- **Adding Models**: Create a new schema in `models/`, then a controller in `controllers/`, and register routes in `routes/`.
- **Error Handling**: Use the global error handler middleware.
- **Database**: Ensure MongoDB is running. Use `seeder.js` to reset or seed initial data.

## Future Improvements

- **Real-time Updates**: Implement Socket.io for real-time order status updates.
- **Caching**: Use Redis for caching frequently accessed data (e.g., styles, products).
- **Testing**: Add unit and integration tests using Jest/Supertest.
- **Logging**: Integrate Winston or Morgan for better logging.
