const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Database connected'))
  .catch((err) => console.log('Database connection error: ', err));

// Import routes
const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Aenzbi AI App Backend');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port $PORT`);
});
