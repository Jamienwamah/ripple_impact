// Import required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Initialize Express.js
const app = express();

// Apply the authentication middleware to the /graphql route
const authenticateToken = require('./authMiddleware');
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Protected route accessed' });
});
app.use('/graphql', authenticateToken);


// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Replace this with your MongoDB connection code
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mydb', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a MongoDB User model (assuming you have a 'User' collection)
const User = mongoose.model('User', {
    username: String,
     password: String,
    });

// Replace with your own secret key for JWT
const secretKey = '#';

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = new User({ username, password: hashedPassword });
    await user.save();

    // For simplicity, we'll just return a success message
    res.status(200).json({ message: 'Signup successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });

    // If user not found or password doesn't match, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    // Return the token to the client
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Setting up apollo servers
const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  server.applyMiddleware({ app });
