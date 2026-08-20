const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Enable JSON body parsing for CRUD
// --- SECURITY MIDDLEWARE ---
// 1. Basic Security Headers (Helmet-lite)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// 2. API Key Restriction Middleware
const API_KEY = process.env.API_KEY || 'fluxive-secure-local-key';
const checkApiKey = (req, res, next) => {
    // Skip for public GET mostly, but strictly enforce for mutations.
    // For this review, we enforce on all /api/ mutations
    if (req.method === 'GET') return next(); // Allow read for now (Academy public)

    const apiKey = req.headers['x-api-key'] || req.query.key;
    if (apiKey === API_KEY) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
};

// Apply to all API routes
app.use('/api/', checkApiKey);

// XML Parser Configuration
const parserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataTagName: "__cdata", // Handled manually if needed, or default
    format: true
};
const parser = new XMLParser(parserOptions);
const builder = new XMLBuilder({ ...parserOptions, format: true });

// Helper to get all courses
const getCoursesFromXML = () => {
    const coursesDir = path.join(__dirname, 'public', 'data', 'courses');

    // Ensure directory exists
    if (!fs.existsSync(coursesDir)) {
        return [];
    }

    const courseFolders = fs.readdirSync(coursesDir).filter(file => {
        return fs.statSync(path.join(coursesDir, file)).isDirectory();
    });

    const courses = [];

    courseFolders.forEach(folder => {
        const xmlPath = path.join(coursesDir, folder, 'course.xml');
        if (fs.existsSync(xmlPath)) {
            try {
                const xmlData = fs.readFileSync(xmlPath, 'utf8');
                const result = parser.parse(xmlData);
                const courseData = result.Course;

                // Extract summary data
                courses.push({
                    id: courseData['@_id'],
                    title: courseData.Metadata.Title,
                    description: courseData.Metadata.Description,
                    price: courseData.Metadata.Price,
                    image: courseData.Metadata.Image, // In real app, resolved to URL
                    folder: folder
                });
            } catch (err) {
                console.error(`Error parsing ${xmlPath}:`, err);
            }
        }
    });

    return courses;
};

// API Endpoint to get all courses
app.get('/api/courses', (req, res) => {
    try {
        const courses = getCoursesFromXML();
        res.json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// API Endpoint to get a specific course
app.get('/api/courses/:id', (req, res) => {
    const courseId = req.params.id;
    const coursesDir = path.join(__dirname, 'public', 'data', 'courses');
    // Simple lookup: scan folders for matching ID in XML OR assume folder name matches ID. 
    // For simplicity, let's assume folder name matches ID or we search.
    // Let's search to be safe if folder != id, but conventionally let's stick to folder=id for now.

    const xmlPath = path.join(coursesDir, courseId, 'course.xml');

    if (fs.existsSync(xmlPath)) {
        try {
            const xmlData = fs.readFileSync(xmlPath, 'utf8');
            const result = parser.parse(xmlData);
            res.json(result.Course); // Return the full converted JSON object
        } catch (err) {
            console.error('Error reading course details:', err);
            res.status(500).json({ error: 'Failed to parse course data' });
        }
    } else {
        res.status(404).json({ error: 'Course not found' });
    }
});

// API Endpoint to CREATE a course (basic)
app.post('/api/courses', (req, res) => {
    // Basic implementation: Create folder and default XML
    const { id, title } = req.body;
    if (!id || !title) return res.status(400).json({ error: 'ID and Title required' });

    const courseDir = path.join(__dirname, 'public', 'data', 'courses', id);
    if (fs.existsSync(courseDir)) {
        return res.status(409).json({ error: 'Course already exists' });
    }

    fs.mkdirSync(courseDir, { recursive: true });

    const defaultXML = `<?xml version="1.0" encoding="UTF-8"?>
<Course id="${id}" version="1.0">
  <Metadata>
    <Title>${title}</Title>
    <Author>Unknown</Author>
    <Description>New Course</Description>
    <Price>0</Price>
  </Metadata>
  <Content></Content>
</Course>`;

    fs.writeFileSync(path.join(courseDir, 'course.xml'), defaultXML);
    res.status(201).json({ message: 'Course created', id });
});

// API Endpoint to UPDATE course (XML)
app.put('/api/courses/:id', (req, res) => {
    const courseId = req.params.id;
    const { xml } = req.body;

    if (!xml) return res.status(400).json({ error: 'XML content required' });

    const coursesDir = path.join(__dirname, 'public', 'data', 'courses');
    const xmlPath = path.join(coursesDir, courseId, 'course.xml');

    if (fs.existsSync(xmlPath)) {
        try {
            fs.writeFileSync(xmlPath, xml);
            res.json({ message: 'Course updated' });
        } catch (err) {
            console.error('Error writing file:', err);
            res.status(500).json({ error: 'Failed to write file' });
        }
    } else {
        res.status(404).json({ error: 'Course not found' });
    }
});

// API Endpoint to DELETE course
app.delete('/api/courses/:id', (req, res) => {
    const courseId = req.params.id;
    const coursesDir = path.join(__dirname, 'public', 'data', 'courses');
    const courseDir = path.join(coursesDir, courseId);

    if (fs.existsSync(courseDir)) {
        try {
            // Recursive delete
            fs.rmSync(courseDir, { recursive: true, force: true });
            res.json({ message: 'Course deleted' });
        } catch (err) {
            console.error('Error deleting course:', err);
            res.status(500).json({ error: 'Failed to delete course' });
        }
    } else {
        res.status(404).json({ error: 'Course not found' });
    }
});

// --- Learning Paths API ---

const pathsFile = path.join(__dirname, 'public', 'data', 'paths.json');

// GET all paths
app.get('/api/paths', (req, res) => {
    if (fs.existsSync(pathsFile)) {
        res.json(JSON.parse(fs.readFileSync(pathsFile, 'utf8')));
    } else {
        res.json([]);
    }
});

// POST (Save/Update) paths
app.post('/api/paths', (req, res) => {
    const { paths } = req.body;
    if (!paths) return res.status(400).json({ error: 'Paths data required' });

    try {
        fs.writeFileSync(pathsFile, JSON.stringify(paths, null, 2));
        res.json({ message: 'Paths saved' });
    } catch (err) {
        console.error('Error saving paths:', err);
        res.status(500).json({ error: 'Failed to save paths' });
    }
});

// --- Cases API ---
app.get('/api/cases', (req, res) => {
    const casesFile = path.join(__dirname, 'public', 'data', 'cases.json');
    if (fs.existsSync(casesFile)) {
        try {
            const data = fs.readFileSync(casesFile, 'utf8');
            res.json(JSON.parse(data));
        } catch (err) {
            console.error('Error reading cases file:', err);
            res.status(500).json({ error: 'Failed to read cases file' });
        }
    } else {
        res.json([]);
    }
});

app.post('/api/cases', (req, res) => {
    const { id, title, description, difficulty, status } = req.body;
    if (!id || !title) return res.status(400).json({ error: 'Missing required fields' });

    const casesFile = path.join(__dirname, 'public', 'data', 'cases.json');
    let cases = [];

    if (fs.existsSync(casesFile)) {
        try {
            cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
        } catch (e) { cases = []; }
    }

    // Check if ID exists
    if (cases.find(c => c.id === id)) {
        return res.status(409).json({ error: 'Case ID already exists' });
    }

    const newCase = { id, title, description, difficulty, status: status || 'Active' };
    cases.push(newCase);

    try {
        fs.writeFileSync(casesFile, JSON.stringify(cases, null, 2));
        res.json({ message: 'Case created', case: newCase });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save case' });
    }
});

app.put('/api/cases/:id', (req, res) => {
    const caseId = req.params.id;
    const updates = req.body;
    const casesFile = path.join(__dirname, 'public', 'data', 'cases.json');

    if (!fs.existsSync(casesFile)) return res.status(404).json({ error: 'No cases found' });

    try {
        let cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
        const index = cases.findIndex(c => c.id === caseId);

        if (index === -1) return res.status(404).json({ error: 'Case not found' });

        // Update fields
        cases[index] = { ...cases[index], ...updates };

        fs.writeFileSync(casesFile, JSON.stringify(cases, null, 2));
        res.json({ message: 'Case updated', case: cases[index] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update case' });
    }
});

app.delete('/api/cases/:id', (req, res) => {
    const caseId = req.params.id;
    const casesFile = path.join(__dirname, 'public', 'data', 'cases.json');

    if (!fs.existsSync(casesFile)) return res.status(404).json({ error: 'No cases found' });

    try {
        let cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
        const initialLength = cases.length;
        cases = cases.filter(c => c.id !== caseId);

        if (cases.length === initialLength) return res.status(404).json({ error: 'Case not found' });

        fs.writeFileSync(casesFile, JSON.stringify(cases, null, 2));
        res.json({ message: 'Case deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete case' });
    }
});

// Restart server to apply changes if running via nodemon/manually
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
