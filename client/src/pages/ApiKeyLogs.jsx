import { useState, useEffect } from 'react';
import { apiKeysAPI } from '../services/api';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
    TextField,
    InputAdornment,
    Button,
    Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

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
        return date.toLocaleString();
    };

    // Handle refresh button click
    const handleRefresh = () => {
        fetchAllLogs();
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                API Key Usage Logs
            </Typography>

            {/* Search and Filter Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <TextField
                    placeholder="Search by key name, endpoint..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ width: '300px' }}
                />
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* Error message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Logs Table */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    API Request Log
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredLogs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1">
                            {logs.length === 0
                                ? "No API key usage logs found."
                                : "No logs match your search criteria."}
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                    <TableCell>Date/Time</TableCell>
                                    <TableCell>API Key</TableCell>
                                    <TableCell>Key Name</TableCell>
                                    <TableCell>Endpoint</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log.usage_id} hover>
                                        <TableCell>{formatDate(log.request_timestamp)}</TableCell>
                                        <TableCell>
                                            <Typography fontFamily="monospace">
                                                {log.key_value}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{log.key_name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.endpoint}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
} 