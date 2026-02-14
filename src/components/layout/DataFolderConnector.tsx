import { useState, useEffect } from "react";
import { FolderSync, FolderCheck, FolderX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  connectDataDirectory,
  disconnectDataDirectory,
  isDirectoryConnected,
  onConnectionChange,
} from "@/lib/excelDataService";

export function DataFolderConnector() {
  const [connected, setConnected] = useState(isDirectoryConnected);

  useEffect(() => {
    return onConnectionChange(setConnected);
  }, []);

  const handleClick = async () => {
    if (connected) {
      await disconnectDataDirectory();
    } else {
      await connectDataDirectory();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          className={`gap-2 text-xs h-8 ${
            connected
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
          }`}
        >
          {connected ? (
            <>
              <FolderCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Excel Synced</span>
            </>
          ) : (
            <>
              <FolderSync className="h-4 w-4" />
              <span className="hidden sm:inline">Connect Folder</span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {connected ? (
          <p>Changes auto-save to Excel files. Click to disconnect.</p>
        ) : (
          <p>Connect your public/data folder to auto-save changes to Excel files.</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
