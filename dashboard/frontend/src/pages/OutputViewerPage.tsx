import { useState } from "react";
import FileExplorer from "@/components/results/FileExplorer";
import FilePreview from "@/components/results/FilePreview";
import { FolderOpen } from "lucide-react";

export default function OutputViewerPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Output Viewer</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* File list */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 lg:col-span-1">
          <div className="border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-400">results/</span>
            </div>
          </div>
          <FileExplorer selected={selectedFile} onSelect={setSelectedFile} />
        </div>

        {/* Preview panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 lg:col-span-2">
          <div className="border-b border-zinc-800 px-4 py-3">
            <span className="text-sm font-medium text-zinc-400">
              {selectedFile || "Select a file to preview"}
            </span>
          </div>
          <div className="min-h-[300px]">
            {selectedFile ? (
              <FilePreview filename={selectedFile} />
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-zinc-600">
                  Select a file from the list to preview its contents
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
