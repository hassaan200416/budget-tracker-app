const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for cleanup'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Import User model
const User = require('./src/models/User').default;

async function clearAllUsers() {
  try {
    console.log('Starting user cleanup...');
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} users from the database.`);
    
    // Also clear entries and notifications if they exist
    try {
      const Entry = require('./src/models/Entry').default;
      const Notification = require('./src/models/Notification').default;
      
      const entryResult = await Entry.deleteMany({});
      const notificationResult = await Notification.deleteMany({});
      
      console.log(`Also cleared ${entryResult.deletedCount} entries and ${notificationResult.deletedCount} notifications.`);
    } catch (error) {
      console.log('Note: Entry or Notification models might not exist yet, skipping their cleanup.');
    }
    
    console.log('Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
}

// Run the cleanup
clearAllUsers();
