import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { insertRow, updateRow } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/lib/RoleContext";
import type { ContractDetail } from "@/types";

interface Props { contract: ContractDetail; }

export function NotesTab({ contract }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canEdit } = useRole();
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const noteRecord = contract.contract_notes?.[0];
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: canEdit ? "Add contract notes..." : "No notes yet." }),
    ],
    content: noteRecord?.content || "",
    editable: canEdit,
    onUpdate: () => setSaveStatus("unsaved"),
  });

  const saveContent = useCallback(async () => {
    if (!editor) return;
    setSaveStatus("saving");
    const content = editor.getHTML();
    try {
      if (noteRecord) {
        await updateRow("contract_notes", noteRecord.id, { content });
      } else {
        await insertRow("contract_notes", { contract_id: contract.id, content });
      }
      setSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["contract-detail", contract.id] });
    } catch (err) {
      console.error("Error:", err);
      toast({ title: "Operation failed", description: "Unable to save notes. Please try again.", variant: "destructive" });
      setSaveStatus("unsaved");
    }
  }, [editor, noteRecord, contract.id, queryClient, toast]);

  // Auto-save every 10 seconds when unsaved
  useEffect(() => {
    if (saveStatus === "unsaved") {
      autoSaveTimer.current = setTimeout(saveContent, 10000);
    }
    return () => clearTimeout(autoSaveTimer.current);
  }, [saveStatus, saveContent]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button type="button" onClick={onClick}
      className={`p-2 rounded-md transition-colors ${active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
      {children}
    </button>
  );

  return (
    <div className="mt-4 space-y-3">
      {canEdit && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-wrap glass-card p-1 rounded-lg">
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineIcon className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-6 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}><Heading1 className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-6 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-6 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}><AlignLeft className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}><AlignCenter className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}><AlignRight className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-6 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></ToolBtn>
          </div>
          <span className={`text-xs font-medium ${saveStatus === "saved" ? "text-success" : saveStatus === "saving" ? "text-warning" : "text-muted-foreground"}`}>
            {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved changes"}
          </span>
        </div>
      )}

      <div className="glass-card tiptap-editor">
        <EditorContent editor={editor} />
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <Button className="btn-gradient-primary" disabled={saveStatus === "saved"} onClick={saveContent}>
            Save Notes
          </Button>
        </div>
      )}
    </div>
  );
}
