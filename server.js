const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true // allow cookies to be sent
}));
