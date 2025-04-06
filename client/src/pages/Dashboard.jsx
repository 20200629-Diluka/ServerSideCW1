import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { countriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardMedia,
    CardContent,
    Alert,
    Link,
    CircularProgress,
    FormHelperText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Dashboard() {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApiKey, setSelectedApiKey] = useState('');
    const [apiKeys, setApiKeys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('name');

    const { user } = useAuth();

    // Fetch API keys
    useEffect(() => {
        const fetchApiKeys = async () => {
            try {
                // Use the apiKeysAPI instead of raw fetch
                const response = await fetch('http://localhost:5000/api/keys', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch API keys');
                }

                const data = await response.json();
                console.log('API keys received:', data.keys);

                // Check if API keys exist and are in the correct format
                if (data.keys && data.keys.length > 0) {
                    // Filter to only active keys and ensure we have the raw key
                    const keys = data.keys
                        .filter(key => key.is_active === 1) // Only use active keys
                        .map(key => {
                            console.log('Key from server:', key);
                            return {
                                ...key,
                                key: key.key.trim() // Ensure there's no whitespace
                            };
                        });

                    console.log(`Filtered to ${keys.length} active keys out of ${data.keys.length} total keys`);

                    setApiKeys(keys);

                    // Select the first key by default if there are any active keys
                    if (keys.length > 0) {
                        const selectedKey = keys[0].key;
                        console.log('Selected API key:', selectedKey);
                        setSelectedApiKey(selectedKey);
                    } else {
                        // If no active keys, show an error
                        setError('No active API keys found. Please activate a key or create a new one.');
                    }
                } else {
                    console.log('No API keys found');
                    setApiKeys([]);
                }
            } catch (err) {
                console.error('Error fetching API keys:', err);
                setError('Failed to load API keys. Please go to the API Keys page to create one.');
            }
        };

        fetchApiKeys();
    }, []);

    // Fetch all countries when an API key is selected
    useEffect(() => {
        // Don't automatically fetch countries when API key is selected
        // Instead, show a message to the user to start a search
        if (selectedApiKey) {
            setLoading(false);
        }
    }, [selectedApiKey]);

    // Handle search
    const handleSearch = async (e) => {
        e.preventDefault();

        if (!selectedApiKey) return;

        setLoading(true);
        setError(null);

        try {
            let response;

            if (!searchTerm) {
                // If no search term, fetch all countries
                response = await countriesAPI.getAllCountries(selectedApiKey);
            } else {
                // Otherwise, perform specific search
                switch (searchType) {
                    case 'name':
                        response = await countriesAPI.getCountryByName(searchTerm, selectedApiKey);
                        break;
                    case 'region':
                        response = await countriesAPI.getCountriesByRegion(searchTerm, selectedApiKey);
                        break;
                    case 'code':
                        response = await countriesAPI.getCountryByCode(searchTerm, selectedApiKey);
                        break;
                    case 'currency':
                        response = await countriesAPI.getCountriesByCurrency(searchTerm, selectedApiKey);
                        break;
                    case 'language':
                        response = await countriesAPI.getCountriesByLanguage(searchTerm, selectedApiKey);
                        break;
                    default:
                        response = await countriesAPI.getCountryByName(searchTerm, selectedApiKey);
                }
            }

            // Handle single country response format
            if (response.data.data && Array.isArray(response.data.data)) {
                setCountries(response.data.data);
            } else if (response.data.data) {
                setCountries([response.data.data]);
            } else {
                setCountries([]);
            }
        } catch (err) {
            console.error('Error searching countries:', err);
            setError(`No results found for "${searchTerm}" in ${searchType}.`);
            setCountries([]);
        } finally {
            setLoading(false);
        }
    };

    // Format currencies for display
    const formatCurrencies = (currencies) => {
        if (!currencies) return 'N/A';

        return Object.entries(currencies)
            .map(([code, currency]) => `${code}: ${currency.name} (${currency.symbol || 'No symbol'})`)
            .join(', ');
    };

    // Format languages for display
    const formatLanguages = (languages) => {
        if (!languages) return 'N/A';

        return Object.values(languages).join(', ');
    };

    // Function to activate all API keys
    const activateAllKeys = async () => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch('http://localhost:5000/api/keys/fix-inactive-keys', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to activate API keys');
            }

            const data = await response.json();
            console.log('API keys activation response:', data);

            // Reload the API keys after activation
            window.location.reload();
        } catch (err) {
            console.error('Error activating API keys:', err);
            setError('Failed to activate API keys. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                Dashboard
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Welcome, {user?.username}!
                </Typography>
                <Typography variant="body1" paragraph>
                    Use this dashboard to explore country data from the RestCountries API.
                </Typography>

                {apiKeys.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body1">You don't have any API keys yet.</Typography>
                        <Link component={RouterLink} to="/api-keys">
                            Create an API key
                        </Link> to start using the API.
                    </Alert>
                ) : (
                    <Box sx={{ mb: 3 }}>
                        {apiKeys.filter(key => key.is_active === 1).length === 0 && (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                <Typography variant="body1">You have API keys but none are active.</Typography>
                                <Button
                                    onClick={activateAllKeys}
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 1 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Activating...' : 'Activate All Keys'}
                                </Button>
                            </Alert>
                        )}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel id="api-key-select-label">Select API Key</InputLabel>
                            <Select
                                labelId="api-key-select-label"
                                id="api-key-select"
                                value={selectedApiKey}
                                label="Select API Key"
                                onChange={(e) => setSelectedApiKey(e.target.value)}
                            >
                                {apiKeys.map((key) => (
                                    <MenuItem key={key.id} value={key.key}>
                                        {key.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                )}

                <Box component="form" onSubmit={handleSearch} noValidate>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Search for a country"
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel id="search-type-label">Search by</InputLabel>
                                <Select
                                    labelId="search-type-label"
                                    id="search-type"
                                    value={searchType}
                                    label="Search by"
                                    onChange={(e) => setSearchType(e.target.value)}
                                >
                                    <MenuItem value="name">Name</MenuItem>
                                    <MenuItem value="region">Region</MenuItem>
                                    <MenuItem value="code">Country Code</MenuItem>
                                    <MenuItem value="currency">Currency</MenuItem>
                                    <MenuItem value="language">Language</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                startIcon={<SearchIcon />}
                                disabled={!selectedApiKey || loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {countries.map((country, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={country.flags.png}
                                    alt={country.flags.alt || `Flag of ${country.name.common}`}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {country.name.common}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                                        {country.name.official}
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        <Box component="span" fontWeight="bold">Capital: </Box>
                                        {country.capital && country.capital.length > 0
                                            ? country.capital.join(', ')
                                            : 'N/A'}
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        <Box component="span" fontWeight="bold">Currencies: </Box>
                                        {formatCurrencies(country.currencies)}
                                    </Typography>

                                    <Typography variant="body2">
                                        <Box component="span" fontWeight="bold">Languages: </Box>
                                        {formatLanguages(country.languages)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {countries.length === 0 && !loading && !error && (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6">
                                    No countries to display. Try searching for a country.
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}
        </Container>
    );
} 