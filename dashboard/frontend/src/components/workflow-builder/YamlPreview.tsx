import { useMemo, lazy, Suspense, useState } from "react";
import { useWorkflowBuilderStore } from "@/stores/workflowBuilderStore";
import { generateWorkflowYaml } from "@/lib/yaml-generator";
import { Copy, Check } from "lucide-react";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

interface YamlPreviewProps {
  editable?: boolean;
  onYamlChange?: (yaml: string) => void;
}

export default function YamlPreview({ editable = false, onYamlChange }: YamlPreviewProps) {
  const { answers, roles } = useWorkflowBuilderStore();
  const [copied, setCopied] = useState(false);

  const yaml = useMemo(() => generateWorkflowYaml(answers, roles), [answers, roles]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (editable) {
    return (
      <div className="h-[500px] rounded-lg border border-zinc-800 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-zinc-900">
              <span className="text-sm text-zinc-500">Loading editor...</span>
            </div>
          }
        >
          <MonacoEditor
            height="100%"
            language="yaml"
            theme="vs-dark"
            value={yaml}
            onChange={(value) => onYamlChange?.(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "JetBrains Mono, monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 12 },
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
        <span className="text-xs font-medium text-zinc-400">YAML Preview</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[400px] overflow-auto p-3 text-xs font-mono text-zinc-300 leading-relaxed">
        {yaml || "# Fill in the form to generate YAML"}
      </pre>
    </div>
  );
}
