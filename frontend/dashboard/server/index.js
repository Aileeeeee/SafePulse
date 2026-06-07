import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { incidents as importedIncidents } from '../src/data/incidentData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

let incidents = [...importedIncidents];
let nextId = incidents.length ? Math.max(...incidents.map((item) => item.id)) + 1 : 1;

app.get('/api/incidents/incidents/', (req, res) => {
  res.json(incidents);
});

app.post('/api/auth/signup/', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  res.status(201).json({ user: { id: 1, email, name: name || 'User' }, token: 'fake-jwt-token' });
});

app.post('/api/auth/login/', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  res.json({ user: { id: 1, email, name: 'Demo User' }, token: 'fake-jwt-token' });
});

app.post('/api/auth/logout/', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/auth/profile/', (req, res) => {
  res.json({ id: 1, email: 'demo@example.com', name: 'Demo User', role: 'Administrator' });
});

app.post('/api/auth/refresh/', (req, res) => {
  res.json({ token: 'fake-jwt-token' });
});

app.get('/api/auth/organisations/search/', (req, res) => {
  const organisations = [
    { id: 1, name: 'SafePulse Community' },
    { id: 2, name: 'Hope Center' },
    { id: 3, name: 'Women Support Network' },
  ];
  const query = (req.query.q || '').toLowerCase();
  const results = organisations.filter((org) => org.name.toLowerCase().includes(query));
  res.json(results);
});

app.get('/api/incidents/incidents/:id/', (req, res) => {
  const id = Number(req.params.id);
  const incident = incidents.find((item) => item.id === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

app.post('/api/incidents/incidents/submit/', (req, res) => {
  const payload = req.body;
  const newIncident = {
    id: nextId++,
    ...payload,
  };
  incidents.unshift(newIncident);
  res.status(201).json(newIncident);
});

app.post('/api/incidents/incidents/:id/acknowledge/', (req, res) => {
  const id = Number(req.params.id);
  const existing = incidents.find((item) => item.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  incidents = incidents.filter((item) => item.id !== id);
  res.json({ ok: true, id });
});

app.get('/api/incidents/incidents/stats/', (req, res) => {
  const total = incidents.length;
  const bySeverity = incidents.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  res.json({ total, bySeverity });
});

app.get('/api/incidents/dashboard/', (req, res) => {
  const open = incidents.filter((item) => item.status !== 'Closed').length;
  const closed = incidents.filter((item) => item.status === 'Closed').length;
  res.json({ open, closed, total: incidents.length });
});

app.get('/api/incidents/coordinator-dashboard/', (req, res) => {
  const severities = incidents.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  res.json({ severities, total: incidents.length });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
