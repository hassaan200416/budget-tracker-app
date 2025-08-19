# Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/budget-app

# JWT Secret for token generation (use a strong, random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port (optional, defaults to 5000)
PORT=5000

# Environment (optional, defaults to development)
NODE_ENV=development
```

## Important Notes:

1. **MONGODB_URI**: Make sure MongoDB is running and accessible
2. **JWT_SECRET**: Use a strong, random string for security
3. **PORT**: The backend will run on this port (default: 5000)
4. **NODE_ENV**: Set to 'production' for production deployments

## Database Cleanup:

To clear all existing users as requested, run:

```bash
node clearUsers.js
```

This will remove all users, entries, and notifications from the database.
