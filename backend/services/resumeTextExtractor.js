const fs = require('fs/promises');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const normalizeWhitespace = (text = '') => text.replace(/\s+/g, ' ').trim();

const extractPdfText = async (filePath) => {
    const buffer = await fs.readFile(filePath);
    const result = await pdfParse(buffer);
    return normalizeWhitespace(result.text || '');
};

const extractDocxText = async (filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    return normalizeWhitespace(result.value || '');
};

const extractResumeText = async (filePath, mimeType = '') => {
    const ext = path.extname(filePath).toLowerCase();

    if (mimeType === 'application/pdf' || ext === '.pdf') {
        return extractPdfText(filePath);
    }

    if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        || ext === '.docx'
    ) {
        return extractDocxText(filePath);
    }

    if (mimeType === 'application/msword' || ext === '.doc') {
        // Legacy .doc is binary and not reliably parsable without heavy system dependencies.
        throw new Error('DOC format is uploaded but analysis supports PDF or DOCX content extraction.');
    }

    throw new Error('Unsupported resume format for analysis. Use PDF or DOCX.');
};

module.exports = { extractResumeText };
