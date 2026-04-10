import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import axios from "@/services/http";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/resume`;

const getAuthHeader = () => {
  const token = localStorage.getItem("nextro_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only PDF or Word documents allowed");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    setFile(selectedFile);
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (targetRole.trim()) {
        formData.append("targetRole", targetRole.trim());
      }

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      setAnalysis(response.data?.analysis || null);
      setUploaded(true);
      toast.success("Resume uploaded and analyzed successfully!");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Upload failed. Please try again.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">CV / Resume Upload</h2>
        <p className="mt-1 text-muted-foreground">
          Upload your CV so our AI can personalise your career path.
        </p>
      </div>

      <input
        type="text"
        value={targetRole}
        onChange={(event) => setTargetRole(event.target.value)}
        placeholder="Optional: target role for job-specific ATS analysis (e.g., Senior Frontend Engineer)"
        className="h-12 w-full rounded-2xl border border-border/40 bg-background px-5 text-sm font-semibold text-foreground transition-colors focus:border-primary/50 focus:outline-none"
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const droppedFile = event.dataTransfer.files[0];
          if (droppedFile) handleFile(droppedFile);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed p-16 transition-all duration-300 ${
          dragging
            ? "border-primary bg-primary/10"
            : "border-border/40 hover:border-primary/50 hover:bg-muted/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            if (selectedFile) handleFile(selectedFile);
          }}
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>

        <div className="text-center">
          <p className="text-lg font-black text-foreground">Drop your CV here</p>
          <p className="text-sm font-medium text-muted-foreground">
            PDF, DOC or DOCX — max 5MB
          </p>
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card/60 p-5">
          <div className="flex items-center gap-4">
            {uploaded ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <FileText className="h-6 w-6 text-primary" />
            )}

            <div>
              <p className="font-black text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!uploaded && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-[#168777] disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            )}

            <button
              onClick={() => {
                setFile(null);
                setUploaded(false);
                setAnalysis(null);
              }}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {analysis && (
        <div className="rounded-2xl border border-border/40 bg-card/60 p-5 space-y-4">
          <h3 className="text-lg font-black">ATS Analysis Report</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-muted/30 p-3 text-sm font-semibold">ATS: {analysis?.scores?.atsCompatibility ?? "N/A"}</div>
            <div className="rounded-xl bg-muted/30 p-3 text-sm font-semibold">Content: {analysis?.scores?.contentStrength ?? "N/A"}</div>
            <div className="rounded-xl bg-muted/30 p-3 text-sm font-semibold">Overall: {analysis?.scores?.overallScore ?? "N/A"}</div>
          </div>
          {analysis?.summary && (
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
          )}
          {Array.isArray(analysis?.actionPlan) && analysis.actionPlan.length > 0 && (
            <div>
              <p className="text-sm font-black uppercase tracking-wider">Priority Action Plan</p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-foreground">
                {analysis.actionPlan.slice(0, 8).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
