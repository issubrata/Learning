// Use a minimal Express-like implementation shipped with this repo
const express = require('./express');
const Url = require('./models/url');
const { sequelize } = require('./models');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// serve the dashboard
app.get('/', (req, res) => {
  const file = path.join(__dirname, 'public', 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) {
      res.statusCode = 500;
      return res.end('Server error');
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(data);
  });
});

app.get('/public/:file', (req, res) => {
  const filePath = path.join(__dirname, 'public', req.params.file);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      return res.end('Not Found');
    }
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else {
      res.setHeader('Content-Type', 'text/plain');
    }
    res.end(data);
  });
});

function generateAlias(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }
  try {
    let alias = generateAlias();
    // ensure alias unique
    let exists = await Url.findOne({ where: { short_alias: alias } });
    while (exists) {
      alias = generateAlias();
      exists = await Url.findOne({ where: { short_alias: alias } });
    }
    const entry = await Url.create({ original_url: url, short_alias: alias });
    return res.json({ short: alias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/:alias', async (req, res) => {
  const { alias } = req.params;
  try {
    const entry = await Url.findOne({ where: { short_alias: alias } });
    if (!entry) {
      return res.status(404).json({ error: 'Alias not found' });
    }
    return res.redirect(entry.original_url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();
