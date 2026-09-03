const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://cv-pro-wot.netlify.app';

app.use(cors({
    origin: ['http://localhost:5500', 'http://localhost:5000', FRONTEND_URL, 'https://cv-pro-wot.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const cvRoutes = require('./routes/cv');
const paymentRoutes = require('./routes/payment');

app.use('/api/cv', cvRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString(), message: 'CV Pro API está funcionando! 🚀' });
});

app.get('/', (req, res) => {
    res.json({
        name: 'CV Pro API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            health: '/api/health',
            cv_generate: '/api/cv/generate (POST)',
            cv_templates: '/api/cv/templates (GET)',
            payment_simulate: '/api/payment/simulate (POST)'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📝 Acesse: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});