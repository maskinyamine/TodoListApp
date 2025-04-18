import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// ✅ Récupérer toutes les tâches avec possibilité de filtrage
router.get('/', async (req, res) => {
  try {
    const { status, priority, sort } = req.query;
    
    let query = 'SELECT * FROM tasks';
    let params = [];
    
    // Construction de la requête avec filtres
    const conditions = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Tri
    if (sort === 'date') {
      query += ' ORDER BY due_date ASC';
    } else if (sort === 'priority') {
      // Ordre personnalisé pour les priorités
      query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END";
    } else if (sort === 'status') {
      // Ordre personnalisé pour les statuts
      query += " ORDER BY CASE status WHEN 'todo' THEN 1 WHEN 'in-progress' THEN 2 WHEN 'done' THEN 3 END";
    }
    
    console.log("Requête SQL envoyée pour récupérer les tâches:", query);
    const [rows] = await db.query(query, params);
    console.log("Tâches récupérées : ", rows.length);
    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des tâches:", err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches.' });
  }
});

// ✅ Ajouter une nouvelle tâche
router.post('/', async (req, res) => {
  const { title, description, priority, status, due_date, tags } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO tasks (title, description, priority, status, due_date, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [title, description, priority, status, due_date, tags || '']
    );
    
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      priority,
      status,
      due_date,
      tags: tags || '',
      created_at: new Date()
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout :', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la tâche.' });
  }
});

// ✅ Mettre à jour une tâche existante
router.put('/:id', async (req, res) => {
  const taskId = req.params.id;
  const { title, description, priority, status, due_date, tags } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, tags = ?, updated_at = NOW() WHERE id = ?',
      [title, description, priority, status, due_date, tags || '', taskId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }
    
    res.json({ message: 'Tâche mise à jour avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la tâche :', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche.' });
  }
});

// ✅ Supprimer une tâche
router.delete('/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la tâche.' });
  }
});

// ✅ Marquer une tâche comme terminée
router.patch('/:id/complete', async (req, res) => {
  const taskId = req.params.id;
  try {
    await db.query('UPDATE tasks SET status = "done", updated_at = NOW() WHERE id = ?', [taskId]);
    res.json({ message: 'Tâche marquée comme terminée' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
  }
});

// ✅ Recherche de tâches
router.get('/search', async (req, res) => {
  const { term } = req.query;
  
  if (!term) {
    return res.status(400).json({ error: 'Terme de recherche requis' });
  }
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ? OR tags LIKE ?',
      [`%${term}%`, `%${term}%`, `%${term}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur lors de la recherche:', err);
    res.status(500).json({ error: 'Erreur lors de la recherche de tâches.' });
  }
});

// ✅ Statistiques des tâches
router.get('/stats', async (req, res) => {
  try {
    const [statusStats] = await db.query(`
      SELECT status, COUNT(*) as count FROM tasks GROUP BY status
    `);
    
    const [priorityStats] = await db.query(`
      SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority
    `);
    
    const [overdueCount] = await db.query(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE due_date < NOW() AND status != 'done'
    `);
    
    res.json({
      status: statusStats,
      priority: priorityStats,
      overdue: overdueCount[0].count
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
  }
});

export default router;