const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('./userModel'); 

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/userdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send({ register: 'failed', message: 'Username already exists' });
        }

        const userId = uuidv4(); 
        const user = new User({ userId, username, password });
        const newUser = await user.save();

        res.status(201).send({ register: 'success', user: newUser });
    } catch (err) {
        console.error('Server issue, try again later', err);
        res.status(500).send({ register: 'failed', message: 'Server error, please try again later' });
    }
};

// Retrieve User Info
const getUserInfo = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).send({ getUserInfo: 'failed', message: 'User not found' });
        }

        res.status(200).send({ getUserInfo: 'success', user });
    } catch (err) {
        console.error('Server issue, try again later', err);
        res.status(500).send({ getUserInfo: 'failed', message: 'Server error, please try again later' });
    }
};

app.post('/register', registerUser);
app.get('/user/:userId', getUserInfo);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
