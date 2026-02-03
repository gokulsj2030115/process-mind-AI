import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { US_STATES } from '../constants/states';
import { Send, MessageSquare, AlertTriangle, Check, BookOpen } from 'lucide-react';

const Home = () => {
    const [selectedState, setSelectedState] = useState(US_STATES[0]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState([]);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        // Optimistic Update
        const currentQ = question;
        setQuestion(''); // Clear input

        // Add user question to UI immediately
        const newEntryId = Date.now();
        setConversation(prev => [...prev, {
            id: newEntryId,
            role: 'user',
            text: currentQ,
            isPending: true
        }]);

        try {
            const res = await api.post('/chat/ask', {
                state: selectedState,
                question: currentQ
            });

            // Update UI with AI response and Grammar Fix
            setConversation(prev => {
                const updated = prev.filter(p => p.id !== newEntryId); // Remove pending

                const items = [...updated];

                // User Question (Corrected display logic)
                items.push({
                    role: 'user',
                    text: currentQ,
                    corrected: res.data.wasCorrected ? res.data.correctedQuestion : null
                });

                // AI Answer
                items.push({
                    role: 'system',
                    text: res.data.answer
                });

                return items;
            });

        } catch (err) {
            console.error(err);
            setConversation(prev => [
                ...prev.filter(p => p.id !== newEntryId),
                { role: 'user', text: currentQ, error: true },
                { role: 'system', text: "Sorry, I encountered an error processing your request." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
            <Navbar />

            <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                        ProcessMind <span className="text-indigo-600 dark:text-indigo-400">Q&A</span>
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Ask questions about state processes and get instant, accurate answers from official documentation.
                    </p>
                </div>

                {/* State Selection */}
                <div className="mb-8 max-w-sm mx-auto">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Select State to Query</label>
                    <select
                        className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg rounded-md border shadow-sm transition-colors"
                        value={selectedState}
                        onChange={(e) => {
                            setSelectedState(e.target.value);
                            setConversation([]); // Clear chat on state switch
                        }}
                    >
                        {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                {/* Chat Interface */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden flex flex-col min-h-[500px] border border-gray-200 dark:border-gray-700 transition-colors">

                    {/* Messages Area */}
                    <div className="flex-grow p-6 space-y-6 overflow-y-auto max-h-[600px] bg-gray-50/50 dark:bg-gray-900/50">
                        {conversation.length === 0 && (
                            <div className="text-center text-gray-400 dark:text-gray-500 mt-20">
                                <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-50" />
                                <p>No questions asked yet for {selectedState}.</p>
                                <p className="text-sm">Try asking: "How do I apply for a license?"</p>
                            </div>
                        )}

                        {conversation.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none'
                                    }`}>

                                    {/* Grammar Correction Notice */}
                                    {msg.role === 'user' && msg.corrected && (
                                        <div className="mb-2 text-xs bg-indigo-700/50 p-2 rounded text-indigo-100 flex items-start">
                                            <Check size={12} className="mt-0.5 mr-1" />
                                            <span>Corrected: "{msg.corrected}"</span>
                                        </div>
                                    )}

                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg rounded-bl-none shadow-sm flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    <span className="text-xs ml-2">Processing...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors">
                        <form onSubmit={handleAsk} className="flex space-x-4">
                            <input
                                type="text"
                                className="flex-grow focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border p-3 transition-colors"
                                placeholder={`Ask a question about ${selectedState}... (typos allowed)`}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !question.trim()}
                                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${loading || !question.trim() ? 'bg-gray-400 dark:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                                    } focus:outline-none transition-colors`}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                        <div className="mt-2 text-center">
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center">
                                <MessageSquare size={12} className="mr-1" />
                                AI-powered answers • Grammar auto-correction enabled
                            </p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Home;
