// auth/auth.service.js
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const dataService = require('../services/data.service');
const User = require('../models/user.model');
const fs = require('fs').promises;
const path = require('path');

const config = require('../config/config');
const saltRounds = config.auth.saltRounds;
const sessionFilePath = process.env.VERCEL
  ? path.join('/tmp', 'session.json')
  : path.join(__dirname, '..', 'public', 'data', 'session.json');

const register = async (username, password, profile, goals, workoutPlanId = null) => {
    const users = await dataService.find('users');
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        throw new Error('User already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User(uuidv4(), username, hashedPassword, profile, goals, workoutPlanId);
    
    return dataService.create('users', newUser);
};

const login = async (username, password) => {
    const users = await dataService.find('users');
    const user = users.find(u => u.username === username);

    if (!user) {
        throw new Error('Invalid username or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Invalid username or password.');
    }

    // Save session
    await fs.writeFile(sessionFilePath, JSON.stringify({ userId: user.id }));

    return user;
};

const logout = async () => {
    await fs.writeFile(sessionFilePath, JSON.stringify({}));
};

const getLoggedInUser = async () => {
    try {
        const data = await fs.readFile(sessionFilePath, 'utf-8');
        const session = JSON.parse(data);
        if (session.userId) {
            return await dataService.findById('users', session.userId);
        }
        return null;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null; // If session file doesn't exist, no one is logged in.
        }
        console.error('Error reading session file:', error);
        return null;
    }
};

module.exports = {
    register,
    login,
    logout,
    getLoggedInUser,
};
