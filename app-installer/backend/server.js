require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
  }
);

const Application = sequelize.define('Application', {
  name: { type: DataTypes.STRING, allowNull: false },
  version: { type: DataTypes.STRING, allowNull: false },
  installScript: { type: DataTypes.TEXT, allowNull: false },
  integrationScript: { type: DataTypes.TEXT, allowNull: false },
  dependencies: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'not installed' },
});

const Log = sequelize.define('Log', {
  appId: { type: DataTypes.INTEGER, allowNull: false },
  logType: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
});

// API Endpoints
app.get('/applications', async (req, res) => {
  const applications = await Application.findAll();
  res.json(applications);
});

app.post('/applications/install', async (req, res) => {
  const { appId } = req.body;
  const application = await Application.findByPk(appId);

  try {
    const { exec } = require('child_process');
    exec(application.installScript, (error, stdout, stderr) => {
      if (error) {
        Log.create({ appId, logType: 'installation', message: stderr });
        return res.status(500).json({ message: 'Installation failed' });
      }
      application.status = 'installed';
      application.save();
      Log.create({ appId, logType: 'installation', message: stdout });
      res.json({ message: 'Installation successful' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during installation' });
  }
});

app.post('/applications/integrate', async (req, res) => {
  const { appId } = req.body;
  const application = await Application.findByPk(appId);

  try {
    const { exec } = require('child_process');
    exec(application.integrationScript, (error, stdout, stderr) => {
      if (error) {
        Log.create({ appId, logType: 'integration', message: stderr });
        return res.status(500).json({ message: 'Integration failed' });
      }
      Log.create({ appId, logType: 'integration', message: stdout });
      res.json({ message: 'Integration successful' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during integration' });
  }
});

app.get('/logs', async (req, res) => {
  const logs = await Log.findAll();
  res.json(logs);
});

// Start the server
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
});
