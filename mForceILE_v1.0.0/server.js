require('dotenv').config();
const express = require('express');
const db = require('./db');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sessionLogin, requireAuth } = require('./perimeter-guard');

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get('/api/v1/health', requireAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'success', db_time: result.rows[0].now });
    } catch (err) {
        console.error('DB Connection Error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});


const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'mforce_ile_ui/build/web'); 

app.get('/', (req, res) => { if (req.cookies.__session) return res.redirect('/app'); res.sendFile(path.join(__dirname, 'perimeter.html')); });
app.post('/sessionLogin', sessionLogin);
app.get('/app', requireAuth, (req, res) => { res.sendFile(path.join(DIST_DIR, 'index.html')); });
app.use(express.static(DIST_DIR, { index: false }));
app.get('*', requireAuth, (req, res) => { res.sendFile(path.join(DIST_DIR, 'index.html')); });

app.listen(PORT, async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS modules (
                id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, content_jsonb JSONB DEFAULT '{}', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database schema initialized for modules.');
    } catch (err) {
        console.error('Failed to initialize database schema:', err);
    }
    console.log(`mForce Perimeter active on port ${PORT}`);
});

app.get('/api/v1/modules', requireAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM modules');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

app.post('/api/v1/modules', requireAuth, async (req, res) => {
    try {
        const { title, content_jsonb } = req.body;
        const result = await db.query(
            'INSERT INTO modules (title, content_jsonb) VALUES ($1, $2) RETURNING *',
            [title, content_jsonb ? JSON.stringify(content_jsonb) : null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create modules' });
    }
});

app.put('/api/v1/modules/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content_jsonb } = req.body;
        const result = await db.query(
            'UPDATE modules SET title = COALESCE($1, title), content_jsonb = COALESCE($2, content_jsonb) WHERE id = $3 RETURNING *',
            [title, content_jsonb ? JSON.stringify(content_jsonb) : null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update modules' });
    }
});

app.delete('/api/v1/modules/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM modules WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ status: 'success', deleted: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete modules' });
    }
});
