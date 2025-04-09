import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { countriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Alert,
    Spinner,
    InputGroup
} from 'react-bootstrap';

export default function Dashboard() {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [selectedApiKey, setSelectedApiKey] = useState('');
    const [apiKeys, setApiKeys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [manualApiKey, setManualApiKey] = useState('');
    const [useManualKey, setUseManualKey] = useState(false);

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

                // Check if API keys exist and are in the correct format
                if (data.keys && data.keys.length > 0) {
                    // Filter to only active keys and ensure we have the raw key
                    const keys = data.keys
                        .filter(key => key.is_active === 1) // Only use active keys
                        .map(key => {
                            return {
                                ...key,
                                key: key.key.trim() // Ensure there's no whitespace
                            };
                        });

                    setApiKeys(keys);

                    // Select the first key by default if there are any active keys
                    if (keys.length > 0) {
                        const selectedKey = keys[0].key;
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
        if (selectedApiKey) {
            setLoading(false);
        }
    }, [selectedApiKey]);

    // Handle search
    const handleSearch = async (e) => {
        e.preventDefault();

        const apiKeyToUse = useManualKey ? manualApiKey : selectedApiKey;
        if (!apiKeyToUse) return;
        
        // Don't perform search if no search term is entered
        if (!searchTerm) return;

        setSearching(true);
        setError(null);

        try {
            // Only search by country name when search term is provided
            const response = await countriesAPI.getCountryByName(searchTerm, apiKeyToUse);

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
            // Check for unauthorized error which indicates invalid API key
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Invalid API key. Please check your API key and try again.');
            } else {
                setError(`No results found for "${searchTerm}".`);
            }
            setCountries([]);
        } finally {
            setSearching(false);
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
        <Container>
            <h1 className="mb-4 fw-bold">Dashboard</h1>

            <Card className="mb-4 shadow-sm">
                <Card.Body className="p-4">
                    <h2 className="h5 mb-3">Welcome, {user?.username}!</h2>
                    <p>Use this dashboard to explore country data from the RestCountries API.</p>

                    {apiKeys.length === 0 ? (
                        <Alert variant="warning" className="mb-3">
                            <p className="mb-0">You don't have any API keys yet.</p>
                            <Link to="/api-keys">
                                Create an API key
                            </Link> to start using the API.
                        </Alert>
                    ) : (
                        <div className="mb-3">
                            {apiKeys.filter(key => key.is_active === 1).length === 0 && (
                                <Alert variant="warning" className="mb-3">
                                    <p className="mb-0">You have API keys but none are active.</p>
                                    <Button
                                        onClick={activateAllKeys}
                                        variant="primary"
                                        className="mt-2"
                                        disabled={loading}
                                    >
                                        {loading ? 'Activating...' : 'Activate All Keys'}
                                    </Button>
                                </Alert>
                            )}
                            <div className="d-flex align-items-center mb-3">
                                <span className="me-2">Use manual API key:</span>
                                <Button 
                                    variant={useManualKey ? "primary" : "outline-primary"}
                                    size="sm"
                                    onClick={() => setUseManualKey(!useManualKey)}
                                    className="me-2"
                                >
                                    {useManualKey ? "On" : "Off"}
                                </Button>
                            </div>

                            {!useManualKey ? (
                                <Form.Group className="mb-3">
                                    <Form.Label>Select API Key</Form.Label>
                                    <Form.Select
                                        value={selectedApiKey}
                                        onChange={(e) => setSelectedApiKey(e.target.value)}
                                    >
                                        {apiKeys.map((key) => (
                                            <option key={key.id} value={key.key}>
                                                {key.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            ) : (
                                <Form.Group className="mb-3">
                                    <Form.Label>Enter API Key manually</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Paste your API key here"
                                        value={manualApiKey}
                                        onChange={(e) => setManualApiKey(e.target.value)}
                                    />
                                </Form.Group>
                            )}
                        </div>
                    )}

                    <Form onSubmit={handleSearch}>
                        <Row className="g-2 align-items-center">
                            <Col md={8}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter country name"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Col>
                            <Col md={4}>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100"
                                    disabled={!(useManualKey ? manualApiKey : selectedApiKey) || searching}
                                >
                                    {searching ? 'Searching...' : 'Search'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {searching ? (
                <div className="d-flex justify-content-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Row>
                    {countries.map((country, index) => (
                        <Col key={index} xs={12} sm={6} md={4} className="mb-4">
                            <Card className="h-100">
                                <Card.Img
                                    variant="top"
                                    src={country.flags.png}
                                    alt={country.flags.alt || `Flag of ${country.name.common}`}
                                    style={{ height: "160px", objectFit: "cover" }}
                                />
                                <Card.Body>
                                    <Card.Title>{country.name.common}</Card.Title>
                                    <Card.Text>
                                        <span className="fw-bold">Capital: </span>
                                        {country.capital && country.capital.length > 0
                                            ? country.capital.join(', ')
                                            : 'N/A'}
                                    </Card.Text>
                                    <Card.Text>
                                        <span className="fw-bold">Currencies: </span>
                                        {formatCurrencies(country.currencies)}
                                    </Card.Text>
                                    <Card.Text>
                                        <span className="fw-bold">Languages: </span>
                                        {formatLanguages(country.languages)}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}

                    {countries.length === 0 && !loading && !error && (
                        <Col xs={12} className="text-center py-5">
                            <h3 className="h6">
                                No countries to display. Try searching for a country.
                            </h3>
                        </Col>
                    )}
                </Row>
            )}
        </Container>
    );
} 