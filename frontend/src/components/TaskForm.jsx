import React, { useState, useEffect } from 'react';
import {
  TextField, Button, MenuItem, Stack, Paper, Typography
} from '@mui/material';
import api from '../api';

const TaskForm = ({ fetchTasks, editingTask, clearEdit }) => {
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium', due_date: ''
  });

  useEffect(() => {
    if (editingTask) {
      setForm(editingTask);
    }
  }, [editingTask]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTask) {
      await api.put(`/tasks/${editingTask.id}`, form);
      clearEdit();
    } else {
      await api.post('/tasks', form);
    }
    fetchTasks();
    setForm({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '' });
  };

return (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{editingTask ? "Modifier" : "Ajouter"} une tâche</Typography>
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <TextField label="Titre" name="title" value={form.title} onChange={handleChange} required />
                <TextField label="Description" name="description" value={form.description} onChange={handleChange} multiline />
                <TextField select label="Statut" name="status" value={form.status} onChange={handleChange}>
                    <MenuItem value="todo">À faire</MenuItem>
                    <MenuItem value="in-progress">En cours</MenuItem>
                    <MenuItem value="done">Fait</MenuItem>
                </TextField>
                <TextField select label="Priorité" name="priority" value={form.priority} onChange={handleChange}>
                    <MenuItem value="low">Basse</MenuItem>
                    <MenuItem value="medium">Moyenne</MenuItem>
                    <MenuItem value="high">Haute</MenuItem>
                </TextField>
                <TextField
                    type="datetime-local"
                    label="Date et Heure"
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" type="submit">{editingTask ? "Modifier" : "Ajouter"}</Button>
            </Stack>
        </form>
    </Paper>
);
};

export default TaskForm;
