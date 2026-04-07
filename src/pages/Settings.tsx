import { useState } from "react";
import { Settings as SettingsIcon, Plus, X, Lock, Key, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSettingsModal } from "@/components/settings/TableSettingsModal";
import { selectAll, insertRow, deleteRow } from "@/lib/excelDataService";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import type { Atoll } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/lib/RoleContext";
import { getOpenAIKey, setOpenAIKey, hasOpenAIKey } from "@/lib/openaiSqlService";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 18 } },
};

export default function SettingsPage() {
  const [showTableSettings, setShowTableSettings] = useState(false);
  const [newAtoll, setNewAtoll] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState(getOpenAIKey());
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { role, canCreate, canDelete } = useRole();

  const handleSaveKey = () => {
    setOpenAIKey(apiKeyInput);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
    toast({ title: apiKeyInput.trim() ? "API key saved" : "API key removed" });
  };

  const handleRemoveKey = () => {
    setApiKeyInput("");
    setOpenAIKey("");
    toast({ title: "API key removed" });
  };

  const { data: atolls } = useQuery({
    queryKey: ["atolls"],
    queryFn: () => (selectAll("atolls") as Atoll[]).sort((a, b) => (a.name || "").localeCompare(b.name || "")),
  });

  const handleAddAtoll = () => {
    const name = newAtoll.trim();
    if (!name) return;
    const exists = atolls?.some((a) => a.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast({ title: "Atoll already exists", variant: "destructive" });
      return;
    }
    insertRow("atolls", { name });
    queryClient.invalidateQueries({ queryKey: ["atolls"] });
    setNewAtoll("");
    toast({ title: `"${name}" added` });
  };

  const handleDeleteAtoll = (id: string, name: string) => {
    deleteRow("atolls", id);
    queryClient.invalidateQueries({ queryKey: ["atolls"] });
    toast({ title: `"${name}" removed` });
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={item} className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      </motion.div>

      <motion.div variants={item}>
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Display Configuration</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Control which tables appear in the navigation and configure column visibility and order for each table.
            </p>
          </div>
          <Button onClick={() => setShowTableSettings(true)} className="btn-gradient-primary">
            Configure Display
          </Button>
        </div>
      </motion.div>

      <ScrollReveal>
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              OpenAI Integration
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your OpenAI API key to power the AI Query Guide in the Query module. Without a key, the Query Guide falls back to basic pattern matching.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative max-w-md flex-1">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKeyInput}
                onChange={(e) => { setApiKeyInput(e.target.value); setKeySaved(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={handleSaveKey} className="btn-gradient-primary" disabled={keySaved}>
              {keySaved ? <><Check className="h-4 w-4 mr-2" /> Saved</> : "Save Key"}
            </Button>
            {hasOpenAIKey() && (
              <Button variant="outline" onClick={handleRemoveKey} className="text-destructive hover:text-destructive">
                Remove
              </Button>
            )}
          </div>
          {hasOpenAIKey() && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-emerald-500 flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              API key configured — AI-powered query generation is active
            </motion.p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Your key is stored locally in the browser and never sent to any server other than OpenAI's API.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Atoll Management</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {role === "Viewer" ? "View the list of atolls available in the Resort Data dropdown." : "Manage the list of atolls available in the Resort Data dropdown."}
            </p>
          </div>
          {canCreate && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter atoll name..."
                value={newAtoll}
                onChange={(e) => setNewAtoll(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAtoll()}
                className="max-w-xs"
              />
              <Button onClick={handleAddAtoll} className="btn-gradient-primary" disabled={!newAtoll.trim()}>
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {atolls?.map((atoll, idx) => (
              <motion.span
                key={atoll.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03, type: "spring", stiffness: 300, damping: 20 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm text-foreground"
              >
                {atoll.name}
                {canDelete && (
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleDeleteAtoll(atoll.id, atoll.name)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </motion.span>
            ))}
            {(!atolls || atolls.length === 0) && (
              <span className="text-sm text-muted-foreground">No atolls configured yet.</span>
            )}
          </div>
        </div>
      </ScrollReveal>

      <TableSettingsModal open={showTableSettings} onClose={() => setShowTableSettings(false)} />
    </motion.div>
  );
}
