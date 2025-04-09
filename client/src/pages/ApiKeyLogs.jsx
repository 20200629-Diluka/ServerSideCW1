import { useState, useEffect } from 'react';
import { apiKeysAPI } from '../services/api';
import {
    Container,
    Card,
    Table,
    Alert,
    Spinner,
    Form,
    Button,
    InputGroup,
    Badge,
    Row,
    Col
} from 'react-bootstrap';

export default function ApiKeyLogs() {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all API key logs
    const fetchAllLogs = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiKeysAPI.getAllLogs();
            const logsData = response.data.logs || [];
            setLogs(logsData);
            setFilteredLogs(logsData);
        } catch (err) {
            console.error('Error fetching API key logs:', err);
            setError('Failed to load API key logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load logs on component mount
    useEffect(() => {
        fetchAllLogs();
    }, []);

    // Handle search filter change
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredLogs(logs);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = logs.filter(
            log =>
                log.key_name.toLowerCase().includes(term) ||
                log.endpoint.toLowerCase().includes(term) ||
                log.key_value.toLowerCase().includes(term)
        );

        setFilteredLogs(filtered);
    }, [searchTerm, logs]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            timeZone: 'UTC',
            dateStyle: 'medium',
            timeStyle: 'medium'
        });
    };

    // Handle refresh button click
    const handleRefresh = () => {
        fetchAllLogs();
    };

    return (
        <Container>
            <h1 className="mb-4 fw-bold">API Key Usage Logs</h1>

            {/* Search and Filter Controls */}
            <Row className="mb-4 align-items-center">
                <Col>
                    <InputGroup>
                        <Form.Control
                            placeholder="Search by key name, endpoint..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button 
                            variant="outline-secondary"
                            onClick={() => setSearchTerm('')}
                            disabled={!searchTerm}
                        >
                            Clear
                        </Button>
                    </InputGroup>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="outline-primary"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </Col>
            </Row>

            {/* Error message */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Logs Table */}
            <Card className="shadow-sm">
                <Card.Body>
                    <h2 className="h5 mb-3">API Request Log</h2>

                    {loading ? (
                        <div className="d-flex justify-content-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="mb-0">
                                {logs.length === 0
                                    ? "No API key usage logs found."
                                    : "No logs match your search criteria."}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead className="table-light">
                                    <tr>
                                        <th>Date/Time</th>
                                        <th>API Key</th>
                                        <th>Key Name</th>
                                        <th>Endpoint</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr key={log.usage_id}>
                                            <td>{formatDate(log.request_timestamp)}</td>
                                            <td>
                                                <code>{log.key_value}</code>
                                            </td>
                                            <td>{log.key_name}</td>
                                            <td>
                                                <Badge bg="primary">
                                                    {log.endpoint}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
} 