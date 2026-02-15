import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Trash2, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  loadModel,
  isModelReady,
  streamChat,
  AVAILABLE_MODELS,
  type ChatMessage,
  type ModelStatus,
} from "@/lib/webLLMService";

interface DisplayMessage extends ChatMessage {
  id: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    ready: false,
    loading: false,
    progress: 0,
    progressText: "",
    error: null,
    modelId: AVAILABLE_MODELS[0].id,
  });
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleLoadModel = useCallback(async (modelId?: string) => {
    const id = modelId || selectedModel;
    setModelStatus((prev) => ({
      ...prev,
      loading: true,
      progress: 0,
      progressText: "Initializing...",
      error: null,
      modelId: id,
    }));

    try {
      await loadModel(id, (report) => {
        setModelStatus((prev) => ({
          ...prev,
          progress: Math.round(report.progress * 100),
          progressText: report.text,
        }));
      });
      setModelStatus((prev) => ({
        ...prev,
        ready: true,
        loading: false,
        progress: 100,
        progressText: "Model ready",
      }));
    } catch (err: any) {
      setModelStatus((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to load model",
      }));
    }
  }, [selectedModel]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming || !modelStatus.ready) return;

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const assistantMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const chatHistory: ChatMessage[] = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: text },
    ];

    try {
      for await (const chunk of streamChat(chatHistory)) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: `Error: ${err.message || "Failed to get response."}` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestions = [
    "How many active contracts do we have?",
    "Which contracts are expiring soon?",
    "Summarize the resort data",
    "List all contract types",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">Ask questions about your contract data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {modelStatus.ready ? (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              Model Ready
            </Badge>
          ) : modelStatus.loading ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Not Loaded
            </Badge>
          )}
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={clearChat} disabled={isStreaming}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
        {!modelStatus.ready ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-5 max-w-md">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mx-auto">
                {modelStatus.loading ? (
                  <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                ) : (
                  <Download className="h-8 w-8 text-violet-500" />
                )}
              </div>

              {modelStatus.loading ? (
                <>
                  <h3 className="text-lg font-semibold">Loading AI Model</h3>
                  <p className="text-sm text-muted-foreground">
                    {modelStatus.progressText}
                  </p>
                  <Progress value={modelStatus.progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {modelStatus.progress}% complete &middot; This may take a moment on first load
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">Load AI Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Select and load an AI model to start chatting. The model runs entirely in your browser — no data leaves your device.
                  </p>

                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-sm">{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {modelStatus.error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                      {modelStatus.error}
                    </p>
                  )}

                  <Button
                    onClick={() => handleLoadModel()}
                    className="btn-gradient-primary"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Load Model
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    The model will be cached in your browser for future use.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-lg">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-violet-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">How can I help?</h3>
                <p className="text-sm text-muted-foreground">
                  I have access to your contract data and can help you analyze it.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    className="text-left text-xs px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50"
                    }`}
                  >
                    {msg.content || (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
                      </span>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        {modelStatus.ready && (
          <div className="border-t border-border/50 p-4">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your contracts..."
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="btn-gradient-primary h-[44px] w-[44px] shrink-0"
                size="icon"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Runs locally in your browser &middot; No data leaves your device
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
