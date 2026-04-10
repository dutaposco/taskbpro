import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5175;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Initial Data Seed
const INITIAL_DATA = {
  projects: [{ id: 'p1', name: 'Project Alpha', color: '#4f46e5' }],
  members: [
    { id: 'm1', name: 'Duta',  email: 'duta@bpro.com',  avatar_color: '#4f46e5' },
    { id: 'm2', name: 'Anto',  email: 'anto@bpro.com',  avatar_color: '#10b981' },
    { id: 'm3', name: 'Angga', email: 'angga@bpro.com', avatar_color: '#f59e0b' },
    { id: 'm4', name: 'Gery',  email: 'gery@bpro.com',  avatar_color: '#ec4899' },
    { id: 'm5', name: 'Pei',   email: 'pei@bpro.com',   avatar_color: '#ef4444' },
  ],
  tasks: []
};

// Database Helpers
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) return INITIAL_DATA;
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// API Routes
app.get('/api/data', (req, res) => res.json(readDB()));

app.post('/api/tasks', (req, res) => {
  const db = readDB();
  const newTask = { ...req.body, id: `t-${Date.now()}`, created_at: new Date().toISOString() };
  db.tasks.push(newTask);
  writeDB(db);
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const db = readDB();
  db.tasks = db.tasks.map(t => t.id === req.params.id ? { ...t, ...req.body } : t);
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  const db = readDB();
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Backend TaskBoard jalan di http://localhost:${PORT}`));
