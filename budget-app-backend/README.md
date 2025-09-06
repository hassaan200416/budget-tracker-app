# Budget Tracking App - Backend

## Overview

A comprehensive Node.js/Express backend for the Budget Tracking App, built with TypeScript and MongoDB. This backend provides a complete REST API for user authentication, expense management, and real-time notifications.

## Technology Stack

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing, CORS protection
- **Validation**: Zod schema validation
- **Testing**: Jest with MongoDB Memory Server
- **Development**: Nodemon for hot reloading

Note: Validation is handled primarily via Mongoose schemas in this project.

## Project Structure

```
src/
├── config/           # Database and environment configuration
├── controllers/      # Request handlers and business logic
├── middleware/       # Authentication and request processing
├── models/          # MongoDB schemas and interfaces
├── routes/          # API endpoint definitions
└── server.ts        # Main application entry point
```

## Features

### 📈 Budget Analysis API (updated)

- `GET /api/entries/analysis?range=last-12-months|last-6-months|last-month`
- last-month: returns daily aggregated expenses for the previous calendar month (with per‑day budget)
- last-6/12-months: returns monthly totals within range
- Response includes budget limit, exceeded flags, and totals

### 🔐 Authentication System

- **User Registration**: Complete signup with budget limit
- **User Login**: Secure authentication with JWT tokens
- **Password Security**: bcrypt hashing with salt rounds
- **Token Management**: JWT-based session management
- **Route Protection**: Middleware-based authentication guards

### 💰 Expense Management

- **CRUD Operations**: Create, read, update, delete expenses
- **User Isolation**: Expenses are user-specific and secure
- **Budget Validation**: Prevents expenses exceeding budget limits
- **Data Integrity**: MongoDB transactions and validation

### 🔔 Notification System

- Stored notifications created on expense add/edit/delete
- User-scoped; latest 50 returned, unread count supported
- Auto-cleanup on server restart (all notifications cleared at boot)

### 🛡️ Security Features

- **CORS**: Frontend origin must match server configuration (see below)
- **Password Hashing**: bcrypt with per-user salt
- **JWT**: Signed tokens with user id and role
- **Env Config**: Secrets and connection strings via `.env`

## API Endpoints

### Authentication Routes (`/api`)

- `POST /signup` - User registration
- `POST /login` - User authentication
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)

### Expense Routes (`/api/entries`) - Protected

- `GET /` - Get all user expenses
- `GET /analysis` - Budget analysis data (daily or monthly depending on range)
- `POST /` - Create new expense
- `PUT /:id` - Update existing expense
- `DELETE /:id` - Delete expense

### Notification Routes (`/api/notifications`) - Protected

- `GET /` - Get all user notifications
- `PUT /:id/read` - Mark notification as read
- `PUT /mark-all-read` - Mark all notifications as read
- `GET /unread-count` - Get unread notification count

## Database Models

### User Model

```typescript
{
  firstName: string;
  lastName: string;
  email: string (unique);
  password: string (hashed);
  budgetLimit: number;
  role: string (default: "user");
}
```

### Entry Model

```typescript
{
  userId: ObjectId (ref: User);
  title: string;
  price: number;
  date: string;
  user: string;
  timestamps: true;
}
```

### Notification Model

```typescript
{
  userId: ObjectId (ref: User);
  message: string;
  type: 'add' | 'edit' | 'delete';
  isRead: boolean;
  timestamps: true;
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/budget-app
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
```

The server enables CORS for a single origin. Update `src/server.ts`:

```ts
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
```

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd budget-app-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Development Scripts

- `npm start` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run Jest test suite

## API Documentation

### Authentication Flow

1. **User Registration**

   ```http
   POST /api/signup
   Content-Type: application/json

   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "password": "securePassword123",
     "budgetLimit": 1000
   }
   ```

2. **User Login**

   ```http
   POST /api/login
   Content-Type: application/json

   {
     "email": "john@example.com",
     "password": "securePassword123"
   }
   ```

3. **Protected Route Access**
   ```http
   GET /api/entries
   Authorization: Bearer <jwt-token>
   ```

### Expense Operations

**Create Expense**

```http
POST /api/entries
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "price": 75.50,
  "date": "2024-12-20"
}
```

**Update Expense**

```http
PUT /api/entries/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Grocery Shopping",
  "price": 80.00,
  "date": "2024-12-20"
}
```

### Profile Operations

**Get Profile**

```http
GET /api/profile
Authorization: Bearer <jwt-token>
```

**Update Profile**

```http
PUT /api/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "budgetLimit": 2000,
  "jobTitle": "Engineer",
  "phoneNumber": "123-456-7890",
  "profileImageUrl": "data:image/png;base64,...." // or null to remove
}
```

## Error Handling

The API uses consistent error responses:

```typescript
{
  "message": "Error description",
  "status": 400/401/404/500
}
```

Common error codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Security Considerations

- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation
- **CORS Configuration**: Restricted to the frontend origin
- **Environment Variables**: Sensitive data in .env files
- **Database Indexing**: Optimized queries with proper indexes

## Testing

The project includes Jest testing framework with MongoDB Memory Server for isolated testing:

```bash
npm test
```

## Performance Optimizations

- **Database Indexing**: User-specific queries optimized
- **Connection Pooling**: MongoDB connection management
- **Async Operations**: Non-blocking I/O operations
- **Memory Management**: Efficient data structures

## Deployment

### Production Considerations

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure MongoDB Atlas or production database
- Set up proper CORS origins
- Implement rate limiting
- Use HTTPS in production

### Docker (example)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

ISC License - see LICENSE file for details

## Support

For issues and questions:

- Create an issue in the GitHub repository
- Check the documentation
- Review the code examples

---

**Last Updated**: August 2025  
**Version**: 1.0.0  
**Status**: Production Ready
