// IMPORTANT: Move dotenv config to the very top, before any other requires
const dotenv = require('dotenv');
const path = require('path');

console.log('Current directory:', __dirname);

// Load environment variables with explicit path
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

// Now load other dependencies
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { processExcelRFP, queryRFPData } = require('./excelProcessor');

// Add detailed environment variable logging
console.log('Environment variables after loading:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('PINECONE_API_KEY exists:', !!process.env.PINECONE_API_KEY);
console.log('PINECONE_ENVIRONMENT exists:', !!process.env.PINECONE_ENVIRONMENT);
console.log('PINECONE_INDEX_NAME exists:', !!process.env.PINECONE_INDEX_NAME);

const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for Excel files
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('spreadsheet') || 
            file.mimetype.includes('excel') ||
            file.originalname.match(/\.(xlsx|xls)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed!'), false);
        }
    }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Upload Excel RFP files
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const metadata = {
            rfpId: req.body.rfpId || `RFP-${Date.now()}`,
            title: req.body.title || req.file.originalname,
            uploadDate: new Date().toISOString(),
            category: req.body.category || 'uncategorized'
        };

        const fileBuffer = fs.readFileSync(req.file.path);
        const result = await processExcelRFP(fileBuffer, metadata);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: 'Excel RFP processed successfully',
            details: result
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: error.message });
    }
});

// Query endpoint with category filters
app.post('/api/query', async (req, res) => {
    try {
        console.log('Received query:', req.body.question);
        const { question, filters } = req.body;
        const response = await queryRFPData(question, filters);
        res.json(response);
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get available categories and sheets
app.get('/api/metadata', async (req, res) => {
    try {
        const result = await index.fetch({ ids: [] }); // This is a simplified example
        const metadata = {
            categories: [...new Set(result.vectors.map(v => v.metadata.category))],
            sheets: [...new Set(result.vectors.map(v => v.metadata.sheetName))]
        };
        res.json(metadata);
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // You might want to add notification/logging service here
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // You might want to add notification/logging service here
});