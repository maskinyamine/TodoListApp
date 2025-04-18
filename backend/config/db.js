import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'todolist_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

export default db;  // Utilisation d'export default
