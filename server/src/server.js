import 'dotenv/config';
import app from './app.js';
import { testConnection } from './config/db.js';

const PORT = Number(process.env.PORT) || 5400;

const start = async () => {
  try {
    await testConnection();
    console.log('✅ MySQL connected');
    app.listen(PORT, () => console.log(`🚀 JustLearn API → http://localhost:${PORT}/api/health`));
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
};
start();