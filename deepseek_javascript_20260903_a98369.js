const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato não suportado. Use JPG, PNG ou WEBP.'));
        }
    }
});

router.post('/generate', upload.single('photo'), async (req, res) => {
    try {
        const { name, role, email, phone, location, summary, experience, education, skills, template } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Nome e email são obrigatórios' });
        }

        const cvData = {
            name, role: role || 'Profissional', email, phone: phone || '', location: location || '',
            summary: summary || '', experience: experience || '', education: education || '',
            skills: skills || '', template: template || 'moderno',
            photo: req.file ? `/uploads/${req.file.filename}` : null
        };

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            const pdfPath = path.join(__dirname, '../uploads', `cv-${Date.now()}.pdf`);
            fs.writeFileSync(pdfPath, pdfBuffer);
            
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
            
            res.json({
                success: true,
                message: 'CV gerado com sucesso!',
                data: { cv: cvData, downloadUrl: `${baseUrl}/uploads/${path.basename(pdfPath)}` }
            });
        });

        doc.fontSize(28).font('Helvetica-Bold').text(cvData.name, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(16).font('Helvetica').fillColor('#6C4BF4').text(cvData.role, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#777').text(
            `${cvData.email}${cvData.phone ? ' · ' + cvData.phone : ''}${cvData.location ? ' · ' + cvData.location : ''}`,
            { align: 'center' }
        );
        doc.moveDown(1.5);

        if (cvData.summary) {
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#6C4BF4').text('PERFIL PROFISSIONAL');
            doc.moveDown(0.3);
            doc.fontSize(11).font('Helvetica').fillColor('#333').text(cvData.summary, { width: 500, align: 'justify' });
            doc.moveDown(1);
        }

        if (cvData.experience) {
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#6C4BF4').text('EXPERIÊNCIA PROFISSIONAL');
            doc.moveDown(0.3);
            doc.fontSize(11).font('Helvetica').fillColor('#333').text(cvData.experience, { width: 500, align: 'justify' });
            doc.moveDown(1);
        }

        if (cvData.education) {
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#6C4BF4').text('FORMAÇÃO ACADÉMICA');
            doc.moveDown(0.3);
            doc.fontSize(11).font('Helvetica').fillColor('#333').text(cvData.education, { width: 500, align: 'justify' });
            doc.moveDown(1);
        }

        if (cvData.skills) {
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#6C4BF4').text('COMPETÊNCIAS');
            doc.moveDown(0.3);
            doc.fontSize(11).font('Helvetica').fillColor('#333').text(cvData.skills, { width: 500, align: 'justify' });
            doc.moveDown(1);
        }

        doc.fontSize(8).fillColor('#999').text('CV Pro - Currículo gerado profissionalmente', { align: 'center' });
        doc.end();

    } catch (error) {
        console.error('Erro ao gerar CV:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar currículo: ' + error.message });
    }
});

router.get('/templates', (req, res) => {
    const templates = [
        { id: 'moderno', name: 'Moderno', category: 'moderno' },
        { id: 'executivo', name: 'Executivo', category: 'executivo' },
        { id: 'criativo', name: 'Criativo', category: 'criativo' },
        { id: 'simples', name: 'Simples', category: 'simples' },
        { id: 'academico', name: 'Académico', category: 'academico' }
    ];
    res.json({ success: true, data: templates });
});

module.exports = router;