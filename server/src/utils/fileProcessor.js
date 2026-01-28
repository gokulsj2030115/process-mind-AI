const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const Tesseract = require('tesseract.js');

const processFile = async (filePath, mimetype) => {
    try {
        if (mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        }

        else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }

        else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimetype === 'application/vnd.ms-excel') {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            return xlsx.utils.sheet_to_csv(sheet);
        }

        else if (mimetype.startsWith('image/')) {
            const result = await Tesseract.recognize(filePath, 'eng');
            return result.data.text;
        }

        throw new Error('Unsupported file type');
    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
};

module.exports = { processFile };
