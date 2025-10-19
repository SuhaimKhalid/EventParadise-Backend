# EventParadise Backend API

A robust backend API for EventParadise, an event management platform built with Node.js, TypeScript, and Express. This API handles user authentication, event creation and management, payment processing via Stripe, and email notifications.

## Features

- **User Management**: Registration, login, profile updates, and role-based access control (staff and regular users)
- **Event Management**: Create, read, update, delete events; search events by title; join events
- **Payment Processing**: Secure payment creation and status tracking using Stripe
- **Email Notifications**: Send emails and track delivery status
- **Authentication & Authorization**: JWT-based authentication with middleware for protected routes
- **Database Integration**: PostgreSQL with Row Level Security (RLS) policies
- **Comprehensive Testing**: Unit and integration tests using Jest
- **Development Tools**: Hot reloading, linting, and formatting with ESLint and Prettier

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Payments**: Stripe API
- **Password Hashing**: bcrypt
- **Testing**: Jest with Supertest
- **Development**: ts-node-dev, ESLint, Prettier

## Prerequisites

- Node.js (>=18.0.0)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd EventParadise-Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NODE_ENV=development
   ```

4. Set up the database:

   ```bash
   npm run setup-db
   ```

5. Seed the database with development data:
   ```bash
   npm run seed
   ```

## Usage

### Development

Start the development server with hot reloading:

```bash
npm run dev
```

### Production

Build and start the production server:

```bash
npm run build
npm start
```

### Database Management

- Set up database for development: `npm run db:dev`
- Set up database for testing: `npm run db:test`
- Seed production database: `npm run seed-prod`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:user_id` - Get single user
- `GET /api/users/:user_id/created-events` - Get events created by user (staff only)
- `PATCH /api/users/:user_id` - Update user profile

### Events

- `GET /api/events` - Get all events
- `GET /api/events/search` - Search events by title
- `GET /api/events/:event_id` - Get single event
- `POST /api/events` - Create new event (staff only)
- `PATCH /api/events/:event_id` - Update event (staff only)
- `POST /api/events/:event_id/register` - Join event (authenticated users)
- `DELETE /api/events/:event_id` - Delete event (staff only)

### Event Members

- `GET /api/events/:id/attendees` - Get event attendees (staff only)
- `GET /api/users/:id/events` - Get user's joined events

### Payments

- `POST /api/payments/create` - Create payment (authenticated users)
- `GET /api/payments/:id` - Get payment status
- `PATCH /api/payments/:id` - Update payment (authenticated users)
- `GET /api/users/:id/payments` - Get user's payments

### Emails

- `POST /api/emails/send` - Send email
- `GET /api/emails/:id` - Get email status

## Testing

Run the test suite:

```bash
npm test
```

Tests include unit tests for models and integration tests for API endpoints.

## Project Structure

```
EventParadise-Backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── db/              # Database setup, seeds, and data
│   ├── middlewares/     # Authentication and authorization
│   ├── models/          # Database interaction logic
│   └── api.ts           # Main API routes
├── __test__/            # Test files
├── package.json
├── tsconfig.json
├── jest.config.ts
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Frontend Repository

Check out the frontend application: [EventParadise Frontend](https://github.com/SuhaimKhalid/EventParadise)
