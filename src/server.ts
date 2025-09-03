// Local dev entrypoint; the actual app is exported from ./app for serverless
import app from './app';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));