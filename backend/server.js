const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

// Read DB
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { projects: [], members: [], tasks: [] };
  }
}

// Write DB
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// --- ENDPOINTS ---

app.get('/api/projects', (req, res) => res.json(readDB().projects));
app.post('/api/projects', (req, res) => {
  const db = readDB();
  const newProject = { ...req.body, id: `p-${Date.now()}` };
  db.projects.push(newProject);
  writeDB(db);
  res.status(201).json(newProject);
});
app.put('/api/projects/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const index = db.projects.findIndex(p => p.id === id);
  if (index !== -1) {
    db.projects[index] = { ...db.projects[index], ...req.body };
    writeDB(db);
    res.json(db.projects[index]);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});
app.delete('/api/projects/:id', (req, res) => {
  const db = readDB();
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  db.tasks = db.tasks.filter(t => t.project_id !== req.params.id); // Cascade delete tasks
  writeDB(db);
  res.json({ message: 'Project deleted' });
});

app.get('/api/members', (req, res) => res.json(readDB().members));
app.post('/api/members', (req, res) => {
  const db = readDB();
  const newMember = { ...req.body, id: `m-${Date.now()}` };
  db.members.push(newMember);
  writeDB(db);
  res.status(201).json(newMember);
});
app.put('/api/members/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const index = db.members.findIndex(m => m.id === id);
  if (index !== -1) {
    db.members[index] = { ...db.members[index], ...req.body };
    writeDB(db);
    res.json(db.members[index]);
  } else {
    res.status(404).json({ error: 'Member not found' });
  }
});
app.delete('/api/members/:id', (req, res) => {
  const db = readDB();
  db.members = db.members.filter(m => m.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Member deleted' });
});

app.get('/api/tasks', (req, res) => res.json(readDB().tasks));
app.post('/api/tasks', (req, res) => {
  const db = readDB();
  const newTask = { ...req.body, id: `t-${Date.now()}`, created_at: new Date().toISOString() };
  db.tasks.push(newTask);
  writeDB(db);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const index = db.tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    db.tasks[index] = { ...db.tasks[index], ...req.body };
    writeDB(db);
    res.json(db.tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const db = readDB();
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Task deleted' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
