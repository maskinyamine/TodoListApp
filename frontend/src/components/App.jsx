import React, { useState, useEffect } from 'react';
import { 
  Container, CssBaseline, Box, AppBar, Toolbar, Typography, 
  ThemeProvider, createTheme, IconButton, Drawer, List, 
  ListItem, ListItemIcon, ListItemText, Badge, Divider,
  Switch, FormControlLabel, useMediaQuery, Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import api from './api';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    window.localStorage.getItem('darkMode') === 'true' || false
  );
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0
  });
  
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Créer le thème basé sur le mode sombre/clair
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#3f51b5',
          },
          secondary: {
            main: '#f50057',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 500,
          },
        },
        components: {
          MuiListItem: {
            styleOverrides: {
              root: {
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 16,
              },
            },
          },
        },
      }),
    [darkMode]
  );

  // Basculer le mode sombre
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    window.localStorage.setItem('darkMode', String(newDarkMode));
  };

  // Récupérer les tâches
  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      
      // Mettre à jour les statistiques
      updateStats(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
    }
  };

  // Mettre à jour les statistiques
  const updateStats = (taskData) => {
    const now = new Date();
    
    const stats = {
      total: taskData.length,
      todo: taskData.filter(task => task.status === 'todo').length,
      inProgress: taskData.filter(task => task.status === 'in-progress').length,
      done: taskData.filter(task => task.status === 'done').length,
      overdue: taskData.filter(task => {
        if (!task.due_date || task.status === 'done') return false;
        return new Date(task.due_date) < now;
      }).length
    };
    
    setStats(stats);
  };

  // Éditer une tâche
  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  // Effacer l'édition en cours
  const clearEdit = () => {
    setEditingTask(null);
  };

  // Basculer le tiroir de navigation
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Charger les tâches au démarrage
  useEffect(() => {
    fetchTasks();
  }, []);

  // Mettre à jour le mode sombre au chargement initial
  useEffect(() => {
    if (localStorage.getItem('darkMode') === null) {
      setDarkMode(prefersDarkMode);
    }
  }, [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Barre d'applications */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              TaskMaster Pro
            </Typography>
            
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={stats.overdue} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        
        {/* Tiroir de navigation */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              top: ['48px', '56px', '64px'],
              height: 'auto',
              bottom: 0,
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', py: 2 }}>
            <List>
              <ListItem button selected>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Tableau de bord" />
              </ListItem>
              
              <ListItem button>
                <ListItemIcon>
                  <Badge badgeContent={stats.total} color="primary">
                    <AssignmentIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Tâches" />
              </ListItem>
            </List>
            
            <Divider />
            
            <List>
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Paramètres" />
              </ListItem>
              
              <ListItem>
                <FormControlLabel
                  control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
                  label="Mode sombre"
                />
              </ListItem>
            </List>
            
            <Divider />
            
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2 }}>U</Avatar>
              <Typography variant="body2">Utilisateur</Typography>
            </Box>
          </Box>
        </Drawer>
        
        {/* Contenu principal */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          
          <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Gestion des tâches
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Organisez et gérez efficacement vos tâches quotidiennes
              </Typography>
            </Box>
            
            <TaskForm 
              fetchTasks={fetchTasks} 
              editingTask={editingTask} 
              clearEdit={clearEdit} 
            />
            
            <TaskList 
              onEdit={handleEditTask} 
            />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;