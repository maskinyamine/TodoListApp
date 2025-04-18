import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/tasks.js'; 
import db from './config/db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.send('Bienvenue dans l\'API TodoList 🚀');
});

// Route principale des tâches
app.use('/api/tasks', taskRoutes);

(async () => {
  try {
    await db; // Ensure the database connection is ready
    console.log('✅ Database connection established.');
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to the database:', err);
  }
})();