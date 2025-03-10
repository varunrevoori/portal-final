const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const Company = require('../models/companymodel');
require('dotenv').config();

const companyApp = express.Router();

// Company Registration
companyApp.post('/register', expressAsyncHandler(async (req, res) => {
    const { userType, email, password, companyName, location, description, website } = req.body;

    if (!userType || !email || !password || !companyName) {
        return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
        return res.status(400).json({ message: 'Email is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCompany = new Company({ userType, email, password: hashedPassword, companyName, location, description, website });

    await newCompany.save();
    res.status(201).json({ message: 'Company registered successfully' });
}));

// Company Login
companyApp.post('/login', expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const dbUser = await Company.findOne({ email });
    if (!dbUser) {
        return res.status(401).json({ message: 'Invalid email' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    if (!process.env.SECRET_KEY) {
        return res.status(500).json({ message: 'Server error: SECRET_KEY not defined' });
    }

    const token = jwt.sign(
        { userId: dbUser._id, email: dbUser.email, userType: dbUser.userType },
        process.env.SECRET_KEY,
        { expiresIn: '1d' }
    );

    res.json({ message: 'Login successful', token, user: { email: dbUser.email, userType: dbUser.userType } });
}));

module.exports = companyApp;
