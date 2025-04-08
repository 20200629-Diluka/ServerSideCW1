import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Button,
    MenuItem,
    Avatar,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setDrawerOpen(false);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    return (
        <>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Typography
                            variant="h6"
                            noWrap
                            component={RouterLink}
                            to="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontWeight: 700,
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Countries API
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="menu"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={toggleDrawer(true)}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>

                        <Typography
                            variant="h6"
                            noWrap
                            component={RouterLink}
                            to="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontWeight: 700,
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Countries API
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Button
                                component={RouterLink}
                                to="/"
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                Home
                            </Button>

                            {isAuthenticated && (
                                <>
                                    <Button
                                        component={RouterLink}
                                        to="/dashboard"
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        component={RouterLink}
                                        to="/api-keys"
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        API Keys
                                    </Button>
                                    <Button
                                        component={RouterLink}
                                        to="/api-key-logs"
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        API Logs
                                    </Button>
                                </>
                            )}
                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            {isAuthenticated ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}>
                                        {user?.username}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<LogoutIcon />}
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        component={RouterLink}
                                        to="/login"
                                        color="inherit"
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        component={RouterLink}
                                        to="/register"
                                        variant="contained"
                                        color="secondary"
                                    >
                                        Register
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <List>
                        <ListItem>
                            <Typography variant="h6" component="div">
                                Countries API
                            </Typography>
                        </ListItem>
                        <Divider />
                        <ListItemButton component={RouterLink} to="/">
                            <ListItemText primary="Home" />
                        </ListItemButton>
                        {isAuthenticated ? (
                            <>
                                <ListItemButton component={RouterLink} to="/dashboard">
                                    <ListItemText primary="Dashboard" />
                                </ListItemButton>
                                <ListItemButton component={RouterLink} to="/api-keys">
                                    <ListItemText primary="API Keys" />
                                </ListItemButton>
                                <ListItemButton component={RouterLink} to="/api-key-logs">
                                    <ListItemText primary="API Logs" />
                                </ListItemButton>
                                <Divider />
                                <ListItem>
                                    <Typography variant="body2" color="text.secondary">
                                        Logged in as {user?.username}
                                    </Typography>
                                </ListItem>
                                <ListItemButton onClick={handleLogout}>
                                    <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
                                </ListItemButton>
                            </>
                        ) : (
                            <>
                                <ListItemButton component={RouterLink} to="/login">
                                    <ListItemText primary="Login" />
                                </ListItemButton>
                                <ListItemButton component={RouterLink} to="/register">
                                    <ListItemText primary="Register" />
                                </ListItemButton>
                            </>
                        )}
                    </List>
                </Box>
            </Drawer>
        </>
    );
} 