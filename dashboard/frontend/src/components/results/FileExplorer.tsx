import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ResultFile } from "@/types";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import {
  FileText,
  FileCode,
  Image,
  File,
  Sheet,
} from "lucide-react";

interface FileExplorerProps {
  selected: string | null;
  onSelect: (filename: string) => void;
}

function getIcon(ext: string) {
  switch (ext) {
    case ".md":
    case ".txt":
    case ".docx":
    case ".pdf":
      return FileText;
    case ".json":
    case ".yaml":
    case ".yml":
    case ".py":
    case ".js":
    case ".ts":
    case ".html":
    case ".css":
      return FileCode;
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
    case ".svg":
      return Image;
    case ".xlsx":
    case ".csv":
      return Sheet;
    default:
      return File;
  }
}

export default function FileExplorer({ selected, onSelect }: FileExplorerProps) {
  const { data: files = [] } = useQuery<ResultFile[]>({
    queryKey: ["results"],
    queryFn: api.getResults,
  });

  if (files.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
        No output files yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800">
      {files.map((file) => {
        const Icon = getIcon(file.extension);
        return (
          <button
            key={file.name}
            onClick={() => onSelect(file.name)}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
              selected === file.name
                ? "bg-zinc-800"
                : "hover:bg-zinc-800/50"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-zinc-200">{file.name}</p>
              <p className="text-[10px] text-zinc-600">
                {formatBytes(file.size)} · {formatDate(file.modified)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
