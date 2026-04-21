import { useState } from "react"
import { BASE_URL } from "../../config"
import ReactMarkdown from "react-markdown"

export default function RagChat(){

    const [messages , setMessages] = useState([])
    const [userque , setUserQue] = useState("")
    const [loading , setLoading] = useState(false)
    const [uploadloading , setUploadLoading] = useState(false)
    const [fileuploaded , setFileUploaded] = useState(false)

    async function handleUploadFile(e) {
        if (uploadloading) return

        const formData = new FormData()
        formData.append("file" , e.target.files[0])
        setUploadLoading(true)
        setFileUploaded(false)
        try {
            const res = await fetch(`${BASE_URL}/user/upload/` , {
                method : "POST",
                body : formData
            })
            const data = await res.json()
            const issuccess = data.message?.toLowerCase() === "success"
            setFileUploaded(issuccess)
        } finally {
            setUploadLoading(false)
        }
    }


    async function handleAsk() {
        if (loading) return

        setLoading(true)
        try {
            setMessages(prev => [...prev , {"role" : "user" , "text" : userque}])
            const res = await fetch(`${BASE_URL}/user/chat/` , {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({"question" : userque})
            })

            const data = await res.json()
            setMessages(prev => [...prev , {"role" : "model" , "text" : data.model_answer}])
        } finally {
            setLoading(false)
        }
    }
    return <div className="relative min-h-screen overflow-hidden text-slate-900">
        <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_30%)]" />

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700 shadow-sm backdrop-blur">
                        Intelligent Retrieval
                    </span>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                        RAG chatbot workspace for document-driven answers.
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        Upload a PDF, ask focused questions, and review formatted answers in a clean interface built for quick research.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Format</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">PDF only</p>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Output</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">Markdown-ready</p>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:col-span-1 col-span-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Session</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">Single document flow</p>
                    </div>
                </div>
            </header>

            <div className="grid flex-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
                    <div className="rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-lg shadow-slate-950/20">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Upload</p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Add your source document</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                            Only upload PDF documents so the backend can index and answer against the file correctly.
                        </p>
                    </div>

                    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                        <label htmlFor="document-upload" className="text-sm font-semibold text-slate-900">Upload File</label>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Pick the document you want to explore. The upload action stays exactly the same.
                        </p>
                        <input
                            id="document-upload"
                            type="file"
                            onChange={handleUploadFile}
                            disabled={uploadloading}
                            className="mt-4 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500 shadow-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
                        />
                        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm shadow-sm ${uploadloading ? "border-sky-200 bg-sky-50 text-sky-800" : fileuploaded ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-500"}`}>
                            <p className="font-semibold">
                                {uploadloading ? "Uploading PDF..." : fileuploaded ? "PDF uploaded successfully." : "No PDF uploaded yet."}
                            </p>
                            <p className={`mt-1 ${uploadloading ? "text-sky-700" : fileuploaded ? "text-emerald-700" : "text-slate-500"}`}>
                                {uploadloading ? "Please wait while your document is being processed." : fileuploaded ? "Your document is ready for questions now." : "Choose a PDF file to start the retrieval flow."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workflow</p>
                        <div className="mt-4 space-y-4 text-sm text-slate-600">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                <p className="font-semibold text-slate-900">1. Upload the PDF</p>
                                <p className="mt-1 leading-6">Provide one document to ground the conversation.</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                <p className="font-semibold text-slate-900">2. Ask focused questions</p>
                                <p className="mt-1 leading-6">Use clear prompts for better retrieval quality.</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                <p className="font-semibold text-slate-900">3. Review the response</p>
                                <p className="mt-1 leading-6">Answers render with markdown for easy scanning.</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex min-h-[620px] flex-col rounded-[28px] border border-white/70 bg-white/80 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
                    <div className="border-b border-slate-200/80 px-6 py-6 sm:px-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">Conversation</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Ask questions about your document</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Keep prompts specific to get sharper, more reliable answers from the indexed content.
                                </p>
                            </div>
                            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
                                Live document chat
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1">
                                <label htmlFor="document-question" className="sr-only">Ask Question about document</label>
                                <input
                                    id="document-question"
                                    type="text"
                                    value={userque}
                                    onChange={(e) => setUserQue(e.target.value)}
                                    placeholder="Ask for a summary, key points, definitions, or specific facts..."
                                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAsk()}
                                disabled={loading}
                                className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                            >
                                {loading ? "Waiting..." : "Ask"}
                            </button>
                        </div>
                        {loading && <p className="mt-3 text-sm font-medium text-slate-500">The model is responding. You can send the next question once this answer finishes.</p>}
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 sm:px-8">
                        {messages && messages.map((message , i) => {
                            const isUser = message.role === "user"

                            return <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-3xl rounded-3xl border px-5 py-4 shadow-sm ${isUser ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${isUser ? "bg-white/10 text-slate-200" : "bg-sky-50 text-sky-700"}`}>
                                        {isUser ? "You" : "Assistant"}
                                    </span>
                                    <div className={`mt-3 text-sm leading-7 ${isUser ? "[&_a]:text-sky-200 [&_code]:rounded-md [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:text-slate-300 [&_ol]:space-y-1 [&_p:not(:last-child)]:mb-3 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-slate-300 [&_ul]:space-y-1" : "[&_a]:text-sky-700 [&_a]:underline [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:text-slate-400 [&_ol]:space-y-1 [&_p:not(:last-child)]:mb-3 [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-slate-400 [&_ul]:space-y-1"}`}>
                                        <ReactMarkdown>{message.text}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>
                </section>
            </div>
        </div>
    </div>
}
