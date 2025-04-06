import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ApiIcon from '@mui/icons-material/Api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import KeyIcon from '@mui/icons-material/Key';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    mb: 6
                }}
            >
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Welcome to Countries API Service
                </Typography>

                <Typography variant="h6" sx={{ mb: 6, maxWidth: '800px' }}>
                    A secure middleware service that provides detailed information about countries worldwide
                    from the RestCountries.com API, including country names, currencies, capitals,
                    languages, and flags.
                </Typography>

                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                                Key Features
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleOutlineIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Secure authentication system" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleOutlineIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="API key management" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleOutlineIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Filtered country data" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleOutlineIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Easy-to-use endpoints" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleOutlineIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Usage statistics" />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                                Available Endpoints
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <ApiIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Get all countries" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <ApiIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Search by country name" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <ApiIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Filter by region" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <ApiIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Find by country code" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <ApiIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Filter by currency" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <ApiIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Filter by language" />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>
                </Grid>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="center"
                >
                    {isAuthenticated ? (
                        <>
                            <Button
                                component={RouterLink}
                                to="/dashboard"
                                variant="contained"
                                size="large"
                                startIcon={<DashboardIcon />}
                            >
                                Go to Dashboard
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/api-keys"
                                variant="contained"
                                color="success"
                                size="large"
                                startIcon={<KeyIcon />}
                            >
                                Manage API Keys
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="contained"
                                size="large"
                                startIcon={<LoginIcon />}
                            >
                                Login
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/register"
                                variant="contained"
                                color="secondary"
                                size="large"
                                startIcon={<PersonAddIcon />}
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Stack>
            </Box>
        </Container>
    );
} 