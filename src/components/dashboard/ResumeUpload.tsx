import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/resume`;
const getAuthHeader = () => {
    const token = localStorage.getItem("nextro_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};
export function ResumeUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFile = (f: File) => {
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(f.type)) {
            toast.error("Only PDF or Word documents allowed");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            toast.error("File must be under 5MB");
            return;
        }
        setFile(f);
        setUploaded(false);
    };
    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("resume", file);
            await axios.post(`${API_URL}/upload`, formData, {
                headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" }
            });
            setUploaded(true);
            toast.success("Resume uploaded successfully!");
        } catch {
            toast.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black tracking-tight">CV / Resume Upload</h2>
                <p className="text-muted-foreground mt-1">Upload your CV so our AI can personalise your career path.</p>
            </div>
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-[2rem] border-2 border-dashed p-16 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${dragging ? 'border-primary bg-primary/10' : 'border-border/40 hover:border-primary/50 hover:bg-muted/20'}`}
            >
                <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-black text-foreground">Drop your CV here</p>
                    <p className="text-sm text-muted-foreground font-medium">PDF, DOC or DOCX — max 5MB</p>
                </div>
            </div>
            {file && (
                <div className="flex items-center justify-between p-5 rounded-2xl bg-card/60 border border-border/40">
                    <div className="flex items-center gap-4">
                        {uploaded ? <CheckCircle className="h-6 w-6 text-green-500" /> : <FileText className="h-6 w-6 text-primary" />}
                        <div>
                            <p className="font-black text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!uploaded && (
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="px-6 py-2.5 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:bg-[#168777] transition-colors disabled:opacity-50"
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </button>
                        )}
                        <button onClick={() => { setFile(null); setUploaded(false); }} className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
