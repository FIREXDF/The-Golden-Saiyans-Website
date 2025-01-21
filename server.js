const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Allow cross-origin requests for frontend

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'fightplanner',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Route for submitting version
app.post('/submit-version', (req, res) => {
    const { user_id, version } = req.body;

    if (!user_id || !version) {
        return res.status(400).json({ status: 'error', message: 'Missing user_id or version' });
    }

    const query = `
        INSERT INTO program_users (user_id, version)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE version = ?, last_updated = NOW()
    `;

    db.execute(query, [user_id, version, version], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', message: 'Version updated successfully' });
    });
});

// Route to get version statistics
app.get('/get-version-stats', (req, res) => {
    const query = `
        SELECT version, COUNT(*) AS user_count
        FROM program_users
        GROUP BY version
        ORDER BY user_count DESC;
    `;

    db.execute(query, (err, results) => {
        if (err) {
            console.error('Error fetching version stats:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
