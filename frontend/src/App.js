import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import api from './api';

function App() {
  const [editingTask, setEditingTask] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const fetchTasks = () => setRefresh(prev => !prev);

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" align="center" gutterBottom>📝 Todo List</Typography>
      <TaskForm
        fetchTasks={fetchTasks}
        editingTask={editingTask}
        clearEdit={() => setEditingTask(null)}
      />
      <TaskList
        key={refresh}
        onEdit={task => setEditingTask(task)}
      />
    </Container>
  );
}

export default App;
