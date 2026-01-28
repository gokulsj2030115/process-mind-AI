import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { US_STATES } from '../constants/states';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Loader, Eye, X, Brain } from 'lucide-react';

const AdminDashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadState, setUploadState] = useState(US_STATES[0]);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [lastResponse, setLastResponse] = useState(null);
    const [viewingDoc, setViewingDoc] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents');
            setDocuments(res.data);
        } catch (err) {
            console.error("Failed to fetch docs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('state', uploadState);

        try {
            const res = await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage({ type: 'success', text: 'Document uploaded & processed successfully!' });
            setLastResponse(res.data.document.processed_content);
            setUploadFile(null);
            // Reset file input
            document.getElementById('file-upload').value = '';
            fetchDocuments();
        } catch (err) {
            console.error("Full Upload Error:", err.response?.data);
            setMessage({
                type: 'error',
                text: err.response?.data?.error || err.response?.data?.message || err.message || 'Upload failed'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navbar />

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

                {/* Upload Section */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
                    <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
                        <Upload className="mr-2" size={24} /> Upload New Document
                    </h2>

                    {message && (
                        <div className={`p-4 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                            <div className="flex">
                                {message.type === 'success' ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
                                {message.text}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="border-2 border-indigo-200 dark:border-indigo-900/50 p-3 rounded-md bg-indigo-50/50 dark:bg-indigo-900/10 mb-4 md:mb-0">
                            <label className="block text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                                STEP 1: Select State
                            </label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border transition-colors font-medium"
                                value={uploadState}
                                onChange={(e) => setUploadState(e.target.value)}
                            >
                                {US_STATES.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-indigo-500 dark:text-indigo-400 italic">
                                Ensure you select the correct state for the document.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document (PDF, Word, Excel, Image)</label>
                            <input
                                id="file-upload"
                                type="file"
                                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60 transition-colors"
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={uploading || !uploadFile}
                            className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${uploading ? 'bg-indigo-400 dark:bg-indigo-600' : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'} focus:outline-none transition-colors`}
                        >
                            {uploading ? <Loader className="animate-spin mr-2" size={20} /> : <Upload className="mr-2" size={20} />}
                            {uploading ? 'Processing...' : 'Upload & Process'}
                        </button>
                    </form>
                </div>

                {/* Gemini Response Section */}
                {lastResponse && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-6 mb-8 rounded-r-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold flex items-center text-indigo-900 dark:text-indigo-300">
                                <Brain className="mr-2" size={24} /> Gemini Analysis Result
                            </h2>
                            <button
                                onClick={() => setLastResponse(null)}
                                className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-indigo-900/80 dark:text-indigo-300/80 whitespace-pre-wrap bg-white/50 dark:bg-gray-800/50 p-4 rounded-md border border-indigo-100 dark:border-indigo-800">
                            {lastResponse}
                        </div>
                    </div>
                )}

                {/* Documents List */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Uploaded Documents</h3>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading documents...</div>
                    ) : documents.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 dark:text-gray-400">No documents uploaded yet.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">State</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{doc.state}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                            <FileText size={16} className="mr-2 text-gray-400 dark:text-gray-500" />
                                            {doc.file_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{doc.file_type.split('/')[1]}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(doc.upload_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <button
                                                onClick={() => setViewingDoc(doc)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                                title="View AI Summary"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                title="Delete Document"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Viewing Modal */}
            {viewingDoc && (
                <div
                    className="fixed inset-0 overflow-y-auto"
                    style={{ zIndex: 9999 }}
                >
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setViewingDoc(null)}
                        ></div>

                        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <Brain className="mr-2 text-indigo-500" size={24} />
                                    AI Analysis: {viewingDoc.file_name}
                                </h3>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(viewingDoc.processed_content || "");
                                            alert("Copied to clipboard!");
                                        }}
                                        className="text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        Copy Summary
                                    </button>
                                    <button
                                        onClick={() => setViewingDoc(null)}
                                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/10 custom-scrollbar">
                                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-sans text-base">
                                    {viewingDoc.processed_content && viewingDoc.processed_content.trim() ? (
                                        viewingDoc.processed_content
                                    ) : (
                                        <div className="py-12 text-center text-gray-400 italic bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                                            No AI analysis content found for this document.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Metadata</h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">State</p>
                                            <p className="text-sm font-semibold dark:text-white">{viewingDoc.state}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Processed Date</p>
                                            <p className="text-sm font-semibold dark:text-white">{new Date(viewingDoc.upload_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end bg-gray-50/50 dark:bg-gray-900/50">
                                <button
                                    onClick={() => setViewingDoc(null)}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AdminDashboard;
