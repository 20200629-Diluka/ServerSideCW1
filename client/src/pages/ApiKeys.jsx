import { useState, useEffect } from 'react';
import { apiKeysAPI } from '../services/api';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Switch,
    FormControl,
    FormHelperText,
    IconButton,
    Chip,
    InputLabel,
    CircularProgress,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ApiKeyUsageDialog from '../components/ApiKeyUsageDialog';

export default function ApiKeys() {
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [newKeyName, setNewKeyName] = useState('');
    const [expiryDays, setExpiryDays] = useState(30);
    const [creatingKey, setCreatingKey] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);

    // Usage dialog states
    const [showUsageDialog, setShowUsageDialog] = useState(false);
    const [selectedKeyId, setSelectedKeyId] = useState(null);
    const [usageData, setUsageData] = useState(null);
    const [usageSummary, setUsageSummary] = useState(null);
    const [selectedKeyData, setSelectedKeyData] = useState(null);
    const [loadingUsage, setLoadingUsage] = useState(false);

    // Fetch API keys
    const fetchApiKeys = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiKeysAPI.getAllKeys();
            // Format the keys for display purposes only, but keep original keys intact for functionality
            const keys = (response.data.keys || []).map(key => ({
                ...key,
                displayKey: formatApiKey(key.key)
            }));
            setApiKeys(keys);
        } catch (err) {
            console.error('Error fetching API keys:', err);
            setError('Failed to load API keys. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load API keys on component mount
    useEffect(() => {
        fetchApiKeys();
    }, []);

    // Fetch API key usage data
    const fetchKeyUsage = async (keyId) => {
        setLoadingUsage(true);
        setError(null);

        try {
            const response = await apiKeysAPI.getKeyUsage(keyId);
            setUsageData(response.data.usage);
            setUsageSummary(response.data.summary);
            setSelectedKeyData(response.data.key);
        } catch (err) {
            console.error('Error fetching API key usage:', err);
            setError('Failed to load API key usage data.');
        } finally {
            setLoadingUsage(false);
        }
    };

    // Open usage dialog
    const handleViewUsage = (keyId) => {
        setSelectedKeyId(keyId);
        setShowUsageDialog(true);
        fetchKeyUsage(keyId);
    };

    // Close usage dialog
    const handleCloseUsageDialog = () => {
        setShowUsageDialog(false);
        setSelectedKeyId(null);
        setUsageData(null);
        setUsageSummary(null);
        setSelectedKeyData(null);
    };

    // Create a new API key
    const handleCreateKey = async (e) => {
        e.preventDefault();

        if (!newKeyName.trim()) {
            setError('Please enter a name for your API key');
            return;
        }

        setCreatingKey(true);
        setError(null);
        setSuccessMessage('');

        try {
            const response = await apiKeysAPI.createKey({
                name: newKeyName,
                expiryDays: parseInt(expiryDays, 10) || 30
            });

            // Store the newly created key to display it to the user
            setNewlyCreatedKey(response.data.key);

            // Clear form
            setNewKeyName('');
            setExpiryDays(30);

            // Refresh the list of keys
            fetchApiKeys();

            setSuccessMessage('API key created successfully. Make sure to copy your key now!');
        } catch (err) {
            console.error('Error creating API key:', err);
            setError('Failed to create API key. Please try again.');
        } finally {
            setCreatingKey(false);
        }
    };

    // Toggle API key (activate/deactivate)
    const handleToggleKey = async (keyId) => {
        setError(null);
        setSuccessMessage('');

        try {
            await apiKeysAPI.toggleKey(keyId);

            // Update the key in the local state
            setApiKeys(apiKeys.map(key => {
                if (key.id === keyId) {
                    return { ...key, is_active: key.is_active ? 0 : 1 };
                }
                return key;
            }));

            setSuccessMessage('API key status updated successfully');
        } catch (err) {
            console.error('Error toggling API key:', err);
            setError('Failed to update API key status. Please try again.');
        }
    };

    // Confirmation dialog for deleting a key
    const confirmDeleteKey = (key) => {
        setKeyToDelete(key);
        setShowConfirmation(true);
    };

    // Delete an API key
    const handleDeleteKey = async () => {
        if (!keyToDelete) return;

        setError(null);
        setSuccessMessage('');

        try {
            await apiKeysAPI.deleteKey(keyToDelete.id);

            // Remove the key from the local state
            setApiKeys(apiKeys.filter(key => key.id !== keyToDelete.id));

            setSuccessMessage('API key deleted successfully');
        } catch (err) {
            console.error('Error deleting API key:', err);
            setError('Failed to delete API key. Please try again.');
        } finally {
            setShowConfirmation(false);
            setKeyToDelete(null);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Copy API key to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccessMessage('API key copied to clipboard!');
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

    // Format API key for display (mask the key except first and last 4 characters)
    const formatApiKey = (key) => {
        if (!key || key.length < 10) return key;
        const firstFour = key.substring(0, 4);
        const lastFour = key.substring(key.length - 4);
        return `${firstFour}...${lastFour}`;
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                API Key Management
            </Typography>

            {/* Create new API key */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Create a New API Key
                </Typography>

                <Box component="form" onSubmit={handleCreateKey} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="keyName"
                                label="Key Name"
                                placeholder="e.g., Development Key, Production Key"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="expiryDays"
                                label="Expires After (days)"
                                type="number"
                                value={expiryDays}
                                onChange={(e) => setExpiryDays(e.target.value)}
                                inputProps={{ min: 0, max: 365 }}
                            />
                            <FormHelperText>
                                Set to 0 for a non-expiring key (not recommended for production)
                            </FormHelperText>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="success"
                                disabled={creatingKey}
                                sx={{ mt: 1 }}
                            >
                                {creatingKey ? (
                                    <>
                                        <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create API Key'
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Success message */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {successMessage}
                </Alert>
            )}

            {/* Error message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Newly created key */}
            {newlyCreatedKey && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Your new API key:
                    </Typography>
                    <Paper
                        sx={{
                            p: 2,
                            my: 2,
                            backgroundColor: 'background.paper',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box>{newlyCreatedKey.key}</Box>
                        <IconButton size="small" onClick={() => copyToClipboard(newlyCreatedKey.key)}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Paper>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Important: Copy this key now. You won't be able to see it again!
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => setNewlyCreatedKey(null)}
                        sx={{ mt: 1 }}
                    >
                        Dismiss
                    </Button>
                </Alert>
            )}

            {/* API keys list */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Your API Keys
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : apiKeys.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1">You don't have any API keys yet.</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Key</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Expires</TableCell>
                                    <TableCell>Last Used</TableCell>
                                    <TableCell>Usage Count</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {apiKeys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell>{key.name}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography fontFamily="monospace" sx={{ mr: 1 }}>
                                                    {key.displayKey}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => copyToClipboard(key.key)}
                                                    title="Copy API key"
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{formatDate(key.created_at)}</TableCell>
                                        <TableCell>{formatDate(key.expires_at)}</TableCell>
                                        <TableCell>{formatDate(key.last_used_at)}</TableCell>
                                        <TableCell>{key.usage_count || 0}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Switch
                                                    checked={Boolean(key.is_active)}
                                                    onChange={() => handleToggleKey(key.id)}
                                                    color="success"
                                                />
                                                <Chip
                                                    label={key.is_active ? "Active" : "Inactive"}
                                                    color={key.is_active ? "success" : "error"}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => confirmDeleteKey(key)}
                                                    size="small"
                                                    title="Delete key"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                                <Tooltip title="View usage details">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleViewUsage(key.id)}
                                                        size="small"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the API key "{keyToDelete?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteKey} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* API Key Usage Dialog */}
            <ApiKeyUsageDialog
                open={showUsageDialog}
                onClose={handleCloseUsageDialog}
                loading={loadingUsage}
                keyData={selectedKeyData}
                usageData={usageData}
                summaryData={usageSummary}
            />
        </Container>
    );
} 