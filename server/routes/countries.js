const express = require('express');
const axios = require('axios');
const { verifyApiKey } = require('../middleware/auth');

const router = express.Router();

// Base URL for RestCountries API
const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';

// Helper function to transform country data to our format
const transformCountryData = (country) => {
    return {
        name: {
            common: country.name.common,
            official: country.name.official
        },
        currencies: country.currencies || {},
        capital: country.capital || [],
        languages: country.languages || {},
        flags: {
            png: country.flags?.png || '',
            svg: country.flags?.svg || '',
            alt: country.flags?.alt || ''
        }
    };
};

// Get all countries (filtered data)
router.get('/', verifyApiKey, async (req, res) => {
    try {
        const response = await axios.get(`${REST_COUNTRIES_API}/all`);
        const filteredData = response.data.map(transformCountryData);

        return res.status(200).json({
            success: true,
            count: filteredData.length,
            data: filteredData
        });
    } catch (error) {
        console.error('Error fetching countries:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching countries data',
            error: error.message
        });
    }
});

// Get country by name
router.get('/name/:name', verifyApiKey, async (req, res) => {
    try {
        const { name } = req.params;
        const response = await axios.get(`${REST_COUNTRIES_API}/name/${name}`);
        const filteredData = response.data.map(transformCountryData);

        return res.status(200).json({
            success: true,
            count: filteredData.length,
            data: filteredData
        });
    } catch (error) {
        // Handle 404 errors from the RestCountries API
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Country not found'
            });
        }

        console.error('Error fetching country by name:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching country data',
            error: error.message
        });
    }
});

// Get countries by region
router.get('/region/:region', verifyApiKey, async (req, res) => {
    try {
        const { region } = req.params;
        const response = await axios.get(`${REST_COUNTRIES_API}/region/${region}`);
        const filteredData = response.data.map(transformCountryData);

        return res.status(200).json({
            success: true,
            count: filteredData.length,
            data: filteredData
        });
    } catch (error) {
        // Handle 404 errors from the RestCountries API
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Region not found'
            });
        }

        console.error('Error fetching countries by region:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching region data',
            error: error.message
        });
    }
});

// Get country by code (alpha2, alpha3)
router.get('/code/:code', verifyApiKey, async (req, res) => {
    try {
        const { code } = req.params;
        const response = await axios.get(`${REST_COUNTRIES_API}/alpha/${code}`);

        // The response for a single country is an object, not an array
        const country = Array.isArray(response.data) ? response.data[0] : response.data;
        const filteredData = transformCountryData(country);

        return res.status(200).json({
            success: true,
            data: filteredData
        });
    } catch (error) {
        // Handle 404 errors from the RestCountries API
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Country code not found'
            });
        }

        console.error('Error fetching country by code:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching country data',
            error: error.message
        });
    }
});

// Get countries by currency
router.get('/currency/:currency', verifyApiKey, async (req, res) => {
    try {
        const { currency } = req.params;
        const response = await axios.get(`${REST_COUNTRIES_API}/currency/${currency}`);
        const filteredData = response.data.map(transformCountryData);

        return res.status(200).json({
            success: true,
            count: filteredData.length,
            data: filteredData
        });
    } catch (error) {
        // Handle 404 errors from the RestCountries API
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Currency not found'
            });
        }

        console.error('Error fetching countries by currency:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching currency data',
            error: error.message
        });
    }
});

// Get countries by language
router.get('/language/:language', verifyApiKey, async (req, res) => {
    try {
        const { language } = req.params;
        const response = await axios.get(`${REST_COUNTRIES_API}/lang/${language}`);
        const filteredData = response.data.map(transformCountryData);

        return res.status(200).json({
            success: true,
            count: filteredData.length,
            data: filteredData
        });
    } catch (error) {
        // Handle 404 errors from the RestCountries API
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Language not found'
            });
        }

        console.error('Error fetching countries by language:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching language data',
            error: error.message
        });
    }
});

module.exports = router; 