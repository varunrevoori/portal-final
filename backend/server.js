require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB (Corrected Connection String)
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
     useUnifiedTopology: true,
})
.then(() => console.log("Database connected successfully"))
.catch(err => console.error("Database connection error:", err));

// Import Routes
const studentApp = require('./apis/student');
const companyApp = require('./apis/company');

// Use Routes
app.use('/apis/students', studentApp);
app.use('/apis/companies', companyApp);

// Global error handler
app.use((err, req, res, next) => {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
