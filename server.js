// ============================================
// server.js - RIOOMD Web Panel
// ============================================
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const tools = {
  obfuscator: require('./tools/obfuscator'),
  osint: require('./tools/osint'),
  nikparse: require('./tools/nikparse'),
  vpscheck: require('./tools/vpscheck')
};

function auth(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'No token' });
  next();
}

app.post('/api/obf', auth, async (req, res) => {
  try {
    const result = await tools.obfuscator.obfuscate(req.body.code);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/osint', auth, async (req, res) => {
  try {
    const result = await tools.osint.lookup(req.body.target);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/nik', auth, (req, res) => {
  try {
    const result = tools.nikparse.parse(req.body.nik);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/vps', auth, async (req, res) => {
  try {
    const result = await tools.vpscheck.check(req.body.ip);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const DB_PATH = path.join(__dirname, 'db', 'users.json');
function loadUsers() {
  try { return JSON.parse(fs.readFileSync(DB_PATH)); } catch(e) { return { users: [] }; }
}
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return 'h_' + Math.abs(h).toString(36);
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const data = loadUsers();
  const user = data.users.find(u => u.username === username);
  if (!user || user.password !== hash(password)) {
    return res.status(401).json({ ok: false, error: 'Login gagal' });
  }
  const token = 'tk_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
  res.json({ ok: true, token, username: user.username, role: user.role });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('[RIOOMD] Web panel aktif di http://0.0.0.0:' + PORT);
});
