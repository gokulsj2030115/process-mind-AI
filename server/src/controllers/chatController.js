const supabase = require('../config/supabase');
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini inside functions to ensure fresh env variables
// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
const GEMINI_MODEL = "gemini-3-flash-preview";

exports.askQuestion = async (req, res) => {
    const { state, question } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    try {

        // 1. Grammar Correction
        let correctedQuestion = question; // Default to original
        if (process.env.GEMINI_API_KEY) {
            try {
                const grammarPrompt = `Correct any grammar, spelling, or typing errors in this question while preserving its meaning: "${question}". If the question is already correct, return it as-is. Only return the corrected question text.`;
                const result = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: grammarPrompt
                });
                correctedQuestion = result.text.trim();
            } catch (e) {
                console.error("Grammar check failed (falling back to original):", e.message);
            }
        } else {
            console.warn("GEMINI_API_KEY is missing, skipping AI processing.");
        }

        // 2. Retrieve Context (Documents for the state)
        let context = "";
        if (state) {
            const { data: docs, error } = await supabase
                .from('documents')
                .select('processed_content')
                .eq('state', state); // In real app, use vector search here

            if (docs && docs.length > 0) {
                context = docs.map(d => d.processed_content).join("\n\n");
            } else {
                // If no documents found for the state, return a direct message
                return res.json({
                    originalQuestion: question,
                    correctedQuestion,
                    answer: `I couldn't find any uploaded documentation for ${state}. Please upload a document for this state in the Admin Dashboard to enable Q&A.`,
                    wasCorrected: question !== correctedQuestion
                });
            }
        }

        // 3. Ask Gemini with Context
        let answer = "I cannot answer this question right now.";
        if (process.env.GEMINI_API_KEY) {
            const qaPrompt = `Based on the following process documentation for ${state || 'General'}, answer this question accurately: "${correctedQuestion}". 
        
Context:
${context.substring(0, 25000)}

Answer the question directly and concisely based ONCE ONLY on the context provided. If the answer is a simple fact (like a fee amount), just state it. Avoid "Based on the documentation" or "The process is" preambles unless necessary for clarity. If the answer is not in the context, say "I couldn't find specific information about this in the uploaded documents."`;

            try {
                const result = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: qaPrompt
                });
                answer = result.text;
            } catch (qaError) {
                console.error("QA Step failed. Full Error:", qaError);
                // Log properties of the error specifically for GCP/Quota issues
                if (qaError.status) console.error("Error Status:", qaError.status);
                if (qaError.response) console.error("Error Response Data:", JSON.stringify(qaError.response));

                answer = `The AI is currently unavailable (Error: ${qaError.message})`;
            }
        }

        // 4. Save Conversation
        // Optional: Only save if user is logged in or if we track anonymous sessions
        // For now, let's just save it to the DB for history
        await supabase.from('conversations').insert([
            {
                state: state || 'Uncategorized',
                question: question,
                corrected_question: correctedQuestion,
                answer: answer
            }
        ]);

        res.json({
            originalQuestion: question,
            correctedQuestion,
            answer,
            wasCorrected: question !== correctedQuestion
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error processing question' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { state } = req.query;
        let query = supabase.from('conversations').select('*').order('timestamp', { ascending: false }).limit(50);

        if (state) {
            query = query.eq('state', state);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};
