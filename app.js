require('dotenv').config();
const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const NodeCache = require('node-cache');

// Initialize Express and Cache
const app = express();
const cache = new NodeCache({ stdTTL: 86400 }); // Cache TTL: 24 hours

// Log all incoming requests using Morgan
app.use(morgan('dev'));

// API Key from environment variables
const OMDB_API_KEY = process.env.OMDB_API_KEY;
if (!OMDB_API_KEY) {
    console.error('OMDB_API_KEY is missing from .env file!');
    process.exit(1);
}

// Endpoint to handle movie data requests
app.get('/', async (req, res) => {
    let path = req.url
    const { i, t } = req.query;
    if (!i && !t) {
        return res.status(400).send('Query parameter "i" (IMDB ID) or "t" (movie title) is required.');
    }

    const cacheKey = i ? `i:${i}` : `t:${t.toLowerCase()}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(cachedData);
    }  

    // try {
    //     const response = await axios.get('http://www.omdbapi.com/', {
    //         params: { apikey: OMDB_API_KEY, i, t },
    //     });

    //     if (response.data.Response === 'False') {
    //         return res.status(404).send(response.data.Error);
    //     }
    axios
        .get('http://www.omdbapi.com' + path + '&apikey=2e588a3')
        .then(function (response) {
            let data = response.data;

            cache[path] = data;
            res.status(200).json(data);
        })
        .catch(function (error) {
            res.status(200).json(error.message);
        })
    

        // Store data in cache for future requests
        cache.set(cacheKey, response.data);
        console.log(`Cache miss for ${cacheKey}. Data fetched and cached.`);
        res.json(response.data);
    // } catch (error) {
    //     console.error('Error fetching data from OMDb:', error.message);
    //     res.status(500).send('Internal Server Error');
    // }
;
});

module.exports = app;