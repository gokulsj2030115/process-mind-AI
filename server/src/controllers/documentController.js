const supabase = require('../config/supabase');
const { processFile } = require('../utils/fileProcessor');
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');

// Initialize Gemini inside functions
// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
const GEMINI_MODEL = "gemini-3-flash-preview";

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { state } = req.body;
        const { path: filePath, originalname, mimetype, filename } = req.file;

        // 1. Process File (Extract Text)
        const extractedText = await processFile(filePath, mimetype);

        // 2. Process with Gemini (Summarize/Understand)
        // Only running Gemini if we have some text and a key
        let processedContent = "AI Processing Skipped (No Key or Empty Text)";
        if (extractedText && process.env.GEMINI_API_KEY) {
            const prompt = `Analyze this process documentation for ${state || 'General'}. Extract key processes, steps, and requirements. \n\nContent:\n${extractedText.substring(0, 30000)}`;
            try {
                const result = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt
                });
                processedContent = result.text;
            } catch (aiError) {
                console.error("Gemini Error:", aiError);
                processedContent = "Error during AI processing: " + aiError.message;
            }
        }

        // 3. Save to Supabase
        const { data, error } = await supabase
            .from('documents')
            .insert([
                {
                    state: state || 'Uncategorized',
                    file_name: originalname,
                    file_type: mimetype,
                    original_content: extractedText,
                    processed_content: processedContent,
                    version: 1 // TODO: Handle versioning logic
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            // Return the actual error from Supabase to help debugging (could be RLS, Auth, or Schema)
            return res.status(500).json({
                message: error.message || 'Database Error',
                code: error.code,
                details: error
            });
        }

        if (!data) {
            throw new Error("No data returned from insert");
        }

        // Create a sanitised document object for response
        const responseData = {
            id: data.id,
            state: data.state,
            file_name: data.file_name,
            file_type: data.file_type,
            processed_content: data.processed_content,
            upload_date: data.upload_date,
            version: data.version
        };

        res.status(201).json({ message: 'Document processed successfully', document: responseData });

    } catch (err) {
        console.error("Upload Error Details:", err);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const { state } = req.query;
        let query = supabase.from('documents').select('*').order('upload_date', { ascending: false });

        if (state) {
            query = query.eq('state', state);
        }

        const { data, error } = await query.select('id, state, file_name, file_type, processed_content, upload_date, version');

        if (error) {
            console.error("Supabase Select Error:", error);
            return res.status(403).json({ message: 'Database Error: Permission Denied. Check RLS Policies.' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching documents' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: 'Document deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting document' });
    }
};
