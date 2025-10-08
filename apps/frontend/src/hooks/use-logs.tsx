import { LogsContext } from "@/context/logs";
import { useContext } from "react";

// Create a consumer hook
export const useLogs = () => {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error("useLogs must be used within an LogsProvider");
  }

  return {
    logs: context.logs,
    addLog: context.addLog,
    clearLogs: context.clearLogs,
  };
};
