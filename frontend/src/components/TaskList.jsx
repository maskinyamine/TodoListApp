import React, { useEffect, useState } from 'react';
import {
  List, ListItem, ListItemText, IconButton, Typography, Box, Divider,
  Chip, Paper, TextField, FormControl, Select, MenuItem, InputLabel,
  Grid, Badge, Tooltip, LinearProgress, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FlagIcon from '@mui/icons-material/Flag';
import api from '../api';

const TaskList = ({ onEdit }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sort: ''
  });
  const [stats, setStats] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0
  });

  // Récupération des tâches
  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Construction de l'URL avec les paramètres de filtrage
      let url = '/tasks';
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.sort) params.append('sort', filters.sort);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await api.get(url);
      setTasks(res.data);
      applySearchFilter(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Récupération des statistiques
  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats({
        todo: res.data.status.find(s => s.status === 'todo')?.count || 0,
        inProgress: res.data.status.find(s => s.status === 'in-progress')?.count || 0,
        done: res.data.status.find(s => s.status === 'done')?.count || 0,
        overdue: res.data.overdue || 0
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  // Application du filtre de recherche
  const applySearchFilter = (taskList) => {
    if (!search.trim()) {
      setFilteredTasks(taskList);
      return;
    }
    
    const searchLower = search.toLowerCase();
    const filtered = taskList.filter(task => 
      task.title.toLowerCase().includes(searchLower) || 
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      (task.tags && task.tags.toLowerCase().includes(searchLower))
    );
    
    setFilteredTasks(filtered);
  };

  // Suppression d'une tâche
  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
    fetchStats();
  };
  
  // Marquer une tâche comme terminée
  const completeTask = async (id) => {
    await api.patch(`/tasks/${id}/complete`);
    fetchTasks();
    fetchStats();
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now && date.toDateString() !== now.toDateString();
    
    const formattedDate = date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    
    const formattedTime = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return {
      text: `${formattedDate} à ${formattedTime}`,
      isOverdue
    };
  };

  // Gestion des changements de filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      sort: ''
    });
    setSearch('');
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filters]);

  useEffect(() => {
    applySearchFilter(tasks);
  }, [search]);

  // Style conditionnel basé sur la priorité
  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'high':
        return { color: '#d32f2f', fontWeight: 'bold' };
      case 'medium':
        return { color: '#ff9800' };
      case 'low':
        return { color: '#2e7d32' };
      default:
        return {};
    }
  };

  // Style conditionnel basé sur le statut
  const getStatusChip = (status) => {
    switch(status) {
      case 'todo':
        return { label: 'À faire', color: 'default' };
      case 'in-progress':
        return { label: 'En cours', color: 'primary' };
      case 'done':
        return { label: 'Terminé', color: 'success' };
      default:
        return { label: status, color: 'default' };
    }
  };

  return (
    <Box mt={2}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} /> Filtres et recherche
        </Typography>
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Rechercher"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                name="status"
                value={filters.status}
                label="Statut"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="todo">À faire</MenuItem>
                <MenuItem value="in-progress">En cours</MenuItem>
                <MenuItem value="done">Terminé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priorité</InputLabel>
              <Select
                name="priority"
                value={filters.priority}
                label="Priorité"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Basse</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Trier par</InputLabel>
              <Select
                name="sort"
                value={filters.sort}
                label="Trier par"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Par défaut</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="priority">Priorité</MenuItem>
                <MenuItem value="status">Statut</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Tooltip title="Réinitialiser les filtres">
              <IconButton 
                color="primary" 
                onClick={resetFilters}
                sx={{ border: '1px solid #ddd', borderRadius: 1, p: 1, width: '100%' }}
              >
                <Typography variant="button" sx={{ ml: 1 }}>Réinitialiser</Typography>
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Chip 
              label={`À faire: ${stats.todo}`} 
              color="default" 
              variant="outlined" 
              sx={{ width: '100%' }} 
            />
          </Grid>
          <Grid item xs={3}>
            <Chip 
              label={`En cours: ${stats.inProgress}`} 
              color="primary" 
              variant="outlined" 
              sx={{ width: '100%' }} 
            />
          </Grid>
          <Grid item xs={3}>
            <Chip 
              label={`Terminées: ${stats.done}`} 
              color="success" 
              variant="outlined" 
              sx={{ width: '100%' }} 
            />
          </Grid>
          <Grid item xs={3}>
            <Chip 
              label={`En retard: ${stats.overdue}`} 
              color="error" 
              variant="outlined" 
              sx={{ width: '100%' }} 
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Liste des tâches {filteredTasks.length > 0 && `(${filteredTasks.length})`}
        </Typography>
        
        {loading ? (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            Aucune tâche trouvée
          </Typography>
        ) : (
          <List>
            {filteredTasks.map(task => {
              const dueDate = formatDate(task.due_date);
              
              return (
                <React.Fragment key={task.id}>
                  <ListItem
                    sx={{
                      backgroundColor: 
                        task.status === 'done' ? 'rgba(76, 175, 80, 0.08)' : 
                        dueDate.isOverdue && task.status !== 'done' ? 'rgba(244, 67, 54, 0.08)' : 
                        'transparent',
                      borderRadius: 1,
                      my: 1
                    }}
                    secondaryAction={
                      <Box>
                        {task.status !== 'done' && (
                          <Tooltip title="Marquer comme terminé">
                            <IconButton 
                              edge="end" 
                              onClick={() => completeTask(task.id)}
                              color="success"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Modifier">
                          <IconButton edge="end" onClick={() => onEdit(task)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton edge="end" onClick={() => deleteTask(task.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              textDecoration: task.status === 'done' ? 'line-through' : 'none',
                              color: task.status === 'done' ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {task.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', ml: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip 
                              size="small" 
                              label={getStatusChip(task.status).label}
                              color={getStatusChip(task.status).color}
                              sx={{ mr: 1, mb: 1 }}
                            />
                            
                            <Tooltip title={`Priorité: ${task.priority}`}>
                              <Chip
                                size="small"
                                icon={<FlagIcon />}
                                label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                sx={{ 
                                  mr: 1, 
                                  mb: 1,
                                  backgroundColor: 
                                    task.priority === 'high' ? 'rgba(211, 47, 47, 0.1)' : 
                                    task.priority === 'medium' ? 'rgba(255, 152, 0, 0.1)' : 
                                    'rgba(46, 125, 50, 0.1)',
                                  color: 
                                    task.priority === 'high' ? '#d32f2f' : 
                                    task.priority === 'medium' ? '#ff9800' : 
                                    '#2e7d32'
                                }}
                              />
                            </Tooltip>
                            
                            {task.tags && task.tags.split(',').map((tag, idx) => (
                              <Chip 
                                key={idx} 
                                size="small" 
                                label={tag.trim()} 
                                sx={{ mr: 1, mb: 1 }} 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          {task.description && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ mt: 1, mb: 1 }}
                            >
                              {task.description}
                            </Typography>
                          )}
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: dueDate.isOverdue && task.status !== 'done' ? 'error.main' : 'text.secondary',
                              fontWeight: dueDate.isOverdue && task.status !== 'done' ? 'bold' : 'normal'
                            }}
                          >
                            {task.due_date ? `À rendre le ${dueDate.text}` : 'Aucune échéance'}
                            {dueDate.isOverdue && task.status !== 'done' && ' (EN RETARD)'}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="middle" />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default TaskList;