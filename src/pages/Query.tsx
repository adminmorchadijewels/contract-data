import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Database, Play, Download, Clock, TableIcon, ChevronRight, Copy, Check, RotateCcw, Info, Wand2, ArrowRight, X, Loader2, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { executeQuery, getTableNames, getTableColumns, type QueryResult } from "@/lib/sqlEngine";
import { generateSQL } from "@/lib/nlToSql";
import { generateSQLWithOpenAI, hasOpenAIKey } from "@/lib/openaiSqlService";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const EXAMPLE_QUERIES = [
  { label: "All companies", sql: "SELECT * FROM companies" },
  { label: "Active contracts", sql: "SELECT * FROM contracts\nWHERE end_date > '2025-01-01'\nORDER BY end_date DESC" },
  { label: "Resorts only", sql: "SELECT name, code, atoll, registration_no\nFROM companies\nWHERE type = 'Resort'\nORDER BY name" },
  { label: "Contracts with resort names", sql: "SELECT c.contract_code, c.sub_contract_type,\n       c.start_date, c.end_date, r.name\nFROM contracts c\nJOIN companies r ON c.resort_id = r.id\nORDER BY c.contract_code" },
  { label: "Contracts per type", sql: "SELECT sub_contract_type, COUNT(*)\nFROM contracts\nGROUP BY sub_contract_type" },
  { label: "Standard pricing", sql: "SELECT * FROM pricing_standard\nLIMIT 20" },
];

const MAX_DISPLAY_ROWS = 500;

export default function QueryPage() {
  const [sql, setSql] = useState("SELECT * FROM companies\nORDER BY name\nLIMIT 50");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ sql: string; rowCount: number; ms: number }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Schema info
  const tables = useMemo(() => {
    return getTableNames().map(name => ({
      name,
      columns: getTableColumns(name),
    }));
  }, []);

  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  // Query Guide state
  const [nlInput, setNlInput] = useState("");
  const [nlResult, setNlResult] = useState<{ sql: string; explanation: string; error?: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [nlLoading, setNlLoading] = useState(false);
  const nlInputRef = useRef<HTMLInputElement>(null);
  const aiEnabled = hasOpenAIKey();

  const handleGenerate = useCallback(async () => {
    const trimmed = nlInput.trim();
    if (!trimmed) return;

    if (aiEnabled) {
      setNlLoading(true);
      setNlResult(null);
      try {
        const result = await generateSQLWithOpenAI(trimmed);
        setNlResult(result);
      } finally {
        setNlLoading(false);
      }
    } else {
      const result = generateSQL(trimmed);
      setNlResult(result);
    }
  }, [nlInput, aiEnabled]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    setNlInput(suggestion);
    if (aiEnabled) {
      setNlLoading(true);
      setNlResult(null);
      try {
        const result = await generateSQLWithOpenAI(suggestion);
        setNlResult(result);
      } finally {
        setNlLoading(false);
      }
    } else {
      const r = generateSQL(suggestion);
      setNlResult(r);
    }
  }, [aiEnabled]);

  const handleUseQuery = useCallback(() => {
    if (!nlResult?.sql) return;
    setSql(nlResult.sql);
    setNlResult(null);
    setNlInput("");
    setShowGuide(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [nlResult]);

  const runQuery = useCallback(() => {
    const trimmed = sql.trim();
    if (!trimmed) return;
    const r = executeQuery(trimmed);
    setResult(r);
    if (!r.error) {
      setHistory(prev => [{ sql: trimmed, rowCount: r.rowCount, ms: r.executionMs }, ...prev].slice(0, 20));
    }
  }, [sql]);

  const useAndRun = useCallback(() => {
    if (!nlResult?.sql) return;
    const generatedSql = nlResult.sql;
    setSql(generatedSql);
    setNlResult(null);
    setNlInput("");
    setShowGuide(false);
    // Execute directly with the generated SQL (not from state)
    const r = executeQuery(generatedSql);
    setResult(r);
    if (!r.error) {
      setHistory(prev => [{ sql: generatedSql, rowCount: r.rowCount, ms: r.executionMs }, ...prev].slice(0, 20));
    }
  }, [nlResult]);

  // Ctrl+Enter to run
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
  }, [runQuery]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(120, Math.min(el.scrollHeight, 300)) + "px";
  }, [sql]);

  const exportToExcel = useCallback(() => {
    if (!result || result.rows.length === 0) return;
    const wb = XLSX.utils.book_new();
    const flatRows = result.rows.map((row) => {
      const flat: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(row)) {
        flat[key] = Array.isArray(val) ? JSON.stringify(val) : val;
      }
      return flat;
    });
    const ws = XLSX.utils.json_to_sheet(flatRows);
    XLSX.utils.book_append_sheet(wb, ws, "Query Results");
    XLSX.writeFile(wb, "query_results.xlsx");
  }, [result]);

  const copyResults = useCallback(() => {
    if (!result || result.rows.length === 0) return;
    const header = result.columns.join("\t");
    const rows = result.rows.map(row => result.columns.map(c => row[c] ?? "").join("\t")).join("\n");
    navigator.clipboard.writeText(header + "\n" + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const truncatedColumns = useMemo(() => {
    if (!result) return [];
    // Filter out internal alias columns like "alias.col"
    return result.columns.filter(c => !c.includes("."));
  }, [result]);

  const displayRows = useMemo(() => {
    if (!result) return [];
    return result.rows.slice(0, MAX_DISPLAY_ROWS);
  }, [result]);

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return "NULL";
    if (Array.isArray(val)) return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Query</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left panel: Schema browser */}
        <div className="lg:col-span-1">
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TableIcon className="h-4 w-4 text-primary" />
              Tables
            </h3>
            <div className="space-y-0.5 max-h-[calc(100vh-280px)] overflow-y-auto">
              {tables.map(t => (
                <div key={t.name}>
                  <button
                    onClick={() => setExpandedTable(expandedTable === t.name ? null : t.name)}
                    className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs hover:bg-secondary transition-colors text-left"
                  >
                    <ChevronRight className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${expandedTable === t.name ? "rotate-90" : ""}`} />
                    <span className="font-mono font-medium text-foreground">{t.name}</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto px-1.5 py-0">{t.columns.length}</Badge>
                  </button>
                  {expandedTable === t.name && (
                    <div className="ml-5 pl-2 border-l border-border/50 space-y-0.5 py-1">
                      {t.columns.map(col => (
                        <button
                          key={col}
                          onClick={() => {
                            const el = textareaRef.current;
                            if (el) {
                              const pos = el.selectionStart;
                              const before = sql.slice(0, pos);
                              const after = sql.slice(pos);
                              setSql(before + col + after);
                              setTimeout(() => {
                                el.focus();
                                el.setSelectionRange(pos + col.length, pos + col.length);
                              }, 0);
                            }
                          }}
                          className="block w-full text-left px-2 py-0.5 rounded text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: Editor + Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Query Guide */}
          {!showGuide ? (
            <button
              onClick={() => { setShowGuide(true); setTimeout(() => nlInputRef.current?.focus(), 50); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
            >
              <Wand2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Describe what you need in plain English and get the SQL generated...
              </span>
              {aiEnabled && (
                <Badge variant="secondary" className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  <Sparkles className="h-3 w-3 mr-1" /> AI Powered
                </Badge>
              )}
            </button>
          ) : (
            <div className="glass-card p-4 space-y-3 border-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Query Guide
                  {aiEnabled ? (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                      <Sparkles className="h-3 w-3 mr-1" /> OpenAI
                    </Badge>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => navigate("/settings")} className="inline-flex">
                          <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-secondary/80">
                            <Settings className="h-3 w-3 mr-1" /> Basic Mode
                          </Badge>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Add an OpenAI key in Settings for AI-powered query generation</TooltipContent>
                    </Tooltip>
                  )}
                </h3>
                <button onClick={() => { setShowGuide(false); setNlResult(null); setNlLoading(false); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  ref={nlInputRef}
                  value={nlInput}
                  onChange={e => setNlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleGenerate(); } }}
                  placeholder={aiEnabled
                    ? "Ask anything about your data — AI will generate the perfect query..."
                    : "e.g. Show all resorts in Male atoll, How many contracts per type..."
                  }
                  className="flex-1 text-sm bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                  disabled={nlLoading}
                />
                <Button className="btn-gradient-primary" size="sm" onClick={handleGenerate} disabled={!nlInput.trim() || nlLoading}>
                  {nlLoading ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="h-3.5 w-3.5 mr-1.5" /> Generate</>
                  )}
                </Button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  "Show all resorts",
                  "Active contracts expiring soon",
                  "How many contracts per type",
                  "Contracts with resort names",
                  "Top 10 most expensive standard fares",
                  "Staff special pricing",
                  "All baggage rules",
                  "Expired contracts",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={nlLoading}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              {nlLoading && (
                <div className="flex items-center gap-2 py-3 justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">OpenAI is generating your query...</span>
                </div>
              )}
              {nlResult && !nlLoading && (
                <div className="space-y-2">
                  {nlResult.error ? (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                      <p className="text-sm text-destructive">{nlResult.error}</p>
                    </div>
                  ) : nlResult.sql ? (
                    <>
                      <p className="text-xs text-muted-foreground">{nlResult.explanation}</p>
                      <div className="relative">
                        <pre className="text-sm font-mono bg-secondary/70 rounded-lg p-3 text-foreground overflow-x-auto whitespace-pre-wrap">{nlResult.sql}</pre>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setSql(nlResult.sql); setNlResult(null); }}>
                          Copy to Editor
                        </Button>
                        <Button className="btn-gradient-primary" size="sm" onClick={useAndRun}>
                          <ArrowRight className="h-3.5 w-3.5 mr-1.5" /> Use & Run
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                      <p className="text-sm text-warning">{nlResult.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SQL Editor */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">SQL Editor</h3>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Ctrl+Enter to run</span>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={sql}
              onChange={e => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="w-full font-mono text-sm bg-secondary/50 border border-border/50 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
              placeholder="Write your SQL query here..."
              style={{ minHeight: 120 }}
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5 flex-wrap">
                {EXAMPLE_QUERIES.map((eq, i) => (
                  <button
                    key={i}
                    onClick={() => setSql(eq.sql)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => { setSql(""); setResult(null); }}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Clear
                </Button>
                <Button className="btn-gradient-primary" size="sm" onClick={runQuery}>
                  <Play className="h-3.5 w-3.5 mr-1.5" /> Run Query
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="glass-card overflow-hidden">
              {/* Results toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-secondary/30">
                <div className="flex items-center gap-3">
                  {result.error ? (
                    <Badge variant="destructive" className="text-xs">Error</Badge>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-foreground">
                        {result.rowCount} row{result.rowCount !== 1 ? "s" : ""}
                        {result.rowCount > MAX_DISPLAY_ROWS && (
                          <span className="text-muted-foreground font-normal"> (showing {MAX_DISPLAY_ROWS})</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {result.executionMs.toFixed(1)}ms
                      </span>
                    </>
                  )}
                </div>
                {!result.error && result.rows.length > 0 && (
                  <div className="flex gap-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyResults}>
                          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy to clipboard</TooltipContent>
                    </Tooltip>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={exportToExcel}>
                      <Download className="h-3 w-3 mr-1.5" /> Export Excel
                    </Button>
                  </div>
                )}
              </div>

              {result.error ? (
                <div className="p-4">
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                    <p className="text-sm text-destructive font-mono">{result.error}</p>
                  </div>
                </div>
              ) : result.rows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No rows returned.</div>
              ) : (
                <div className="overflow-x-auto max-h-[60vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="w-12 text-center text-[10px] text-muted-foreground font-mono">#</TableHead>
                        {truncatedColumns.map(col => (
                          <TableHead key={col} className="font-semibold text-xs whitespace-nowrap">{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayRows.map((row, i) => (
                        <TableRow key={i} className="data-table-row">
                          <TableCell className="text-center text-[10px] text-muted-foreground font-mono">{i + 1}</TableCell>
                          {truncatedColumns.map(col => {
                            const val = formatValue(row[col]);
                            const isNull = val === "NULL";
                            return (
                              <TableCell key={col} className={`text-xs max-w-[300px] truncate ${isNull ? "text-muted-foreground/50 italic" : ""}`}>
                                {val}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Query History */}
          {history.length > 0 && (
            <div className="glass-card p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Queries</h3>
              <div className="space-y-1">
                {history.slice(0, 5).map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setSql(h.sql)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <span className="font-mono text-xs text-muted-foreground truncate flex-1">{h.sql.replace(/\n/g, " ")}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{h.rowCount} rows</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{h.ms.toFixed(0)}ms</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
