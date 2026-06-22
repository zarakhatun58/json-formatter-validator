"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import {
  FileUp,
  Download,
  ClipboardPaste,
  Check,
  AlertCircle,
  FileJson,
  Trash2,
  Braces,
  Hash,
  Layers,
} from "lucide-react";
import { cn } from "./lib/utils";
import { ThemeToggle } from "./components/theme-toggle";
import { JsonTreeViewer } from "./components/json-tree-viewer";

// Inline Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const buttonStyles: Record<string, Record<string, string>> = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  },
};

const Button = ({ className, variant = "default", size = "default", asChild, ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const combinedClassName = cn(
    baseStyles,
    buttonStyles.variant[variant],
    buttonStyles.size[size],
    className
  );

  if (asChild) {
    return <span className={combinedClassName} {...props} />;
  }
  return <button className={combinedClassName} {...props} />;
};

// Inline Tabs components
const Tabs = TabsPrimitive.Root;

const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted/50 p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
);

const TabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
);

const TabsContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn(
      "flex-1 mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
);

const SAMPLE_JSON = {
  name: "JSON Formatter & Validator",
  version: "1.0.0",
  description: "A fast, free tool for formatting and validating JSON data",
  features: [
    "Instant formatting",
    "Syntax validation",
    "Interactive tree view",
    "Dark/Light mode",
    "File upload & download",
  ],
  author: {
    name: "Your Name",
    email: "yourname@example.com",
    role: "Full Stack Developer",
  },
  stats: {
    users: 10000,
    rating: 4.8,
    active: true,
  },
  tags: ["json", "formatter", "validator", "developer-tools"],
};

function getJsonStats(data: unknown) {
  if (data === null || typeof data !== "object") {
    return { keys: 0, depth: 0, size: 0 };
  }

  const countKeys = (obj: unknown, depth: number): { keys: number; maxDepth: number; size: number } => {
    if (obj === null || typeof obj !== "object") {
      return { keys: 0, maxDepth: depth, size: 1 };
    }

    const isArray = Array.isArray(obj);
    const entries = isArray ? obj : Object.entries(obj as Record<string, unknown>);
    let totalKeys = isArray ? 0 : entries.length;
    let maxDepth = depth + 1;
    let size = 1;

    for (const val of (isArray ? obj : Object.values(obj as Record<string, unknown>)) as unknown[]) {
      const result = countKeys(val, depth + 1);
      totalKeys += result.keys;
      maxDepth = Math.max(maxDepth, result.maxDepth);
      size += result.size;
    }

    return { keys: totalKeys, maxDepth, size };
  };

  const result = countKeys(data, 0);
  return { keys: result.keys, depth: result.maxDepth, size: result.size };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"formatted" | "tree">("formatted");
  const [stats, setStats] = useState({ keys: 0, depth: 0, size: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatJson = useCallback((value: string, indent: number = 2) => {
    if (!value.trim()) {
      setError(null);
      setOutput("");
      setParsedData(null);
      setStats({ keys: 0, depth: 0, size: 0 });
      return;
    }

    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setParsedData(parsed);
      setError(null);
      setStats(getJsonStats(parsed));
    } catch (e) {
      const err = e as SyntaxError;
      setError(err.message);
      setOutput("");
      setParsedData(null);
      setStats({ keys: 0, depth: 0, size: 0 });
    }
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleInputChange = (value: string) => {
    setInput(value);
    formatJson(value);
  };

  const handleFormat = () => formatJson(input);
  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
    } catch (e) {
      setError((e as SyntaxError).message);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setParsedData(null);
    setError(null);
    setStats({ keys: 0, depth: 0, size: 0 });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(text);
    } catch { /* Clipboard access denied */ }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch { /* Copy failed */ }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => handleInputChange(e.target?.result as string);
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLoadSample = () => {
    const sample = JSON.stringify(SAMPLE_JSON, null, 2);
    setInput(sample);
    formatJson(sample);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                  <FileJson className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  JSON Formatter & Validator
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Instantly format, validate, and explore your JSON data
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Bar */}
        {(output || error) && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {error ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-medium text-destructive">Invalid JSON</span>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Valid JSON</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                  <Braces className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{stats.keys} keys</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Depth: {stats.depth}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{input.length.toLocaleString()} chars</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-xl shadow-black/5">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Input</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{input.length.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={handleLoadSample}>
                  Sample
                </Button>
                <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" id="json-upload" />
                <label htmlFor="json-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer gap-1.5 flex items-center">
                      <FileUp className="h-3.5 w-3.5" />
                      Upload
                    </span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" onClick={handlePaste} className="gap-1.5">
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste
                </Button>
                {input && (
                  <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder='Paste your JSON here or click "Sample" to load an example...'
              className={cn(
                "flex-1 min-h-[320px] lg:min-h-[420px] p-5 text-sm font-mono bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/40 scrollbar-thin",
                error && "bg-destructive/5"
              )}
              spellCheck={false}
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-xl shadow-black/5">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
              <span className="text-sm font-semibold text-foreground">Output</span>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
                <Button variant="outline" size="sm" onClick={handleFormat} disabled={!input}>
                  Format
                </Button>
                <Button variant="outline" size="sm" onClick={handleMinify} disabled={!input}>
                  Minify
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output} className="gap-1.5">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    "Copy"
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5" disabled={!output}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "formatted" | "tree")} className="flex-1 flex flex-col">
              <div className="px-5 pt-3">
                <TabsList>
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="tree">Tree View</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="formatted" className="overflow-auto scrollbar-thin">
                {error ? (
                  <div className="p-5">
                    <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-destructive/20">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-destructive">
                            JSON Parse Error
                          </p>
                          <p className="text-xs text-muted-foreground mt-1.5 font-mono leading-relaxed">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : output ? (
                  <pre className="p-5 text-sm font-mono overflow-auto whitespace-pre leading-relaxed">{output}</pre>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[280px]">
                    <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                      <FileJson className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Formatted JSON will appear here
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="tree" className="overflow-auto scrollbar-thin">
                {parsedData ? (
                  <div className="p-5 text-sm font-mono leading-relaxed">
                    <JsonTreeViewer data={parsedData} />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[280px]">
                    <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                      <Layers className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {error ? "Fix JSON errors to see tree view" : "Tree view will appear here"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              <p className="font-semibold text-foreground">Developer: Jahanara Khatun</p>
              <p className="mt-0.5">Email: jkhatun258@gmail.com</p>
            </div>
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-6 py-2.5 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Built for Digital Heroes
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
