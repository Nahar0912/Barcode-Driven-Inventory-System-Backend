const cors = require('cors');

const corsOptions = {
  origin: 'https://bdis.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

module.exports = cors(corsOptions);
