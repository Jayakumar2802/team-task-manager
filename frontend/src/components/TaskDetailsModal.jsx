import { useState, useEffect } from 'react'
import { X, Send, Paperclip, Download } from 'lucide-react'
import { commentsAPI, attachmentsAPI } from '../services/api'
import { toast } from 'react-toastify'

export default function TaskDetailsModal({ task, onClose }) {
    const [comments, setComments] = useState([])
    const [attachments, setAttachments] = useState([])
    const [newComment, setNewComment] = useState('')

    useEffect(() => {
        fetchComments()
        fetchAttachments()
    }, [task.id])

    const fetchComments = async () => {
        try {
            const { data } = await commentsAPI.getByTask(task.id)
            setComments(data)
        } catch {
            toast.error('Failed to load comments')
        }
    }

    const fetchAttachments = async () => {
        try {
            const { data } = await attachmentsAPI.getByTask(task.id)
            setAttachments(data)
        } catch {
            toast.error('Failed to load attachments')
        }
    }

    const handlePostComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        try {
            await commentsAPI.create({ task_id: task.id, content: newComment })
            setNewComment('')
            fetchComments()
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to post comment')
        }
    }

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0]
        if (!selectedFile) return
        const formData = new FormData()
        formData.append('file', selectedFile)
        try {
            await attachmentsAPI.upload(task.id, formData)
            toast.success('File uploaded!')
            fetchAttachments()
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to upload file')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-gray-800 flex flex-col md:flex-row rounded-xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl border dark:border-gray-700">

                {/* Left Side: Details */}
                <div className="flex-[2] p-8 flex flex-col border-b md:border-b-0 md:border-r dark:border-gray-700 overflow-y-auto">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white leading-tight">{task.title}</h2>
                            <div className="flex gap-2 mt-4">
                                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs uppercase font-bold text-blue-800 dark:text-blue-300">
                                    {task.status.replace('_', ' ')}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs uppercase font-bold text-gray-600 dark:text-gray-300">
                                    {task.priority} Priority
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border dark:border-gray-800 min-h-[120px]">
                            {task.description ? task.description : <span className="text-gray-400 italic">No description provided for this task.</span>}
                        </div>
                    </div>

                    <div className="flex-1 mt-auto">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Paperclip className="w-4 h-4" /> Attachments ({attachments.length})
                            </h3>
                            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                                <Plus className="w-4 h-4" /> Add File
                                <input type="file" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>
                        {attachments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {attachments.map(att => (
                                    <div key={att.id} className="border dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                                            <Download className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={att.file_path.split('_').pop()}>{att.file_path.split('_').pop()}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(att.uploaded_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                No files attached yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Comments */}
                <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/50 min-w-[320px]">
                    <div className="p-6 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm z-10">
                        <h3 className="font-semibold text-gray-800 dark:text-white uppercase tracking-wider text-sm">Activity & Comments ({comments.length})</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {comments.length > 0 ? comments.map(c => (
                            <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-inner">U</div>
                                    <span className="text-xs font-medium text-gray-400">{new Date(c.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed ml-11">{c.content}</p>
                            </div>
                        )) : (
                            <div className="text-center py-10 mt-10">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No comments yet</p>
                                <p className="text-xs text-gray-400 mt-1">Be the first to start the discussion!</p>
                            </div>
                        )}
                    </div>

                    <div className="p-5 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <form onSubmit={handlePostComment} className="flex gap-3">
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Write a message..."
                                className="flex-1 bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 transition-shadow"
                            />
                            <button type="submit" disabled={!newComment.trim()} className="bg-blue-500 text-white p-3 rounded-full flex-shrink-0 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    )
}
