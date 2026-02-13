import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FilePreviewProps {
  filename: string;
}

const PREVIEWABLE = new Set([
  ".md", ".txt", ".json", ".yaml", ".yml", ".csv",
  ".log", ".py", ".js", ".ts", ".html", ".css",
]);

export default function FilePreview({ filename }: FilePreviewProps) {
  const ext = filename.substring(filename.lastIndexOf("."));
  const canPreview = PREVIEWABLE.has(ext);

  const { data: content, isLoading } = useQuery({
    queryKey: ["result-content", filename],
    queryFn: () => api.getResultContent(filename),
    enabled: canPreview,
  });

  if (!canPreview) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-zinc-400">Preview not available for {ext} files</p>
        <a
          href={`/api/results/${filename}`}
          download
          className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
        >
          Download
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <span className="text-sm text-zinc-500">Loading...</span>
      </div>
    );
  }

  if (ext === ".md") {
    return (
      <div className="prose prose-invert prose-sm max-w-none p-4 prose-headings:text-zinc-200 prose-p:text-zinc-400 prose-strong:text-zinc-300 prose-code:text-emerald-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ""}</ReactMarkdown>
      </div>
    );
  }

  return (
    <pre className="max-h-[600px] overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-300">
      {content}
    </pre>
  );
}
