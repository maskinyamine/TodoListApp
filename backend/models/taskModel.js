const db = require('../config/db');

const Task = {
  getAll: (callback) => {
    db.query('SELECT * FROM tasks ORDER BY created_at DESC', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM tasks WHERE id = ?', [id], callback);
  },

  create: (task, callback) => {
    const { title, description, status, priority, due_date } = task;
    db.query(
      'INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [title, description, status, priority, due_date],
      callback
    );
  },

  update: (id, task, callback) => {
    const { title, description, status, priority, due_date } = task;
    db.query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?',
      [title, description, status, priority, due_date, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query('DELETE FROM tasks WHERE id = ?', [id], callback);
  }
};

module.exports = Task;
