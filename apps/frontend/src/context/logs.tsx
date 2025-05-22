import { createContext, useState, type ReactNode } from "react";

// Define the shape of your context value
interface LogsContextValue {
  logs: string[];
  addLog: (log: string) => void;
  clearLogs: () => void;
}

// Create the context
export const LogsContext = createContext<LogsContextValue | undefined>(
  undefined,
);

// Create a provider component
export const LogsProvider = ({
  children,
  initialLogs = [],
}: { children: ReactNode; initialLogs: string[] }) => {
  const [logs, setLogs] = useState<string[]>(initialLogs);

  const addLog = (log: string) => {
    setLogs((logs) => [...logs, log]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <LogsContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogsContext.Provider>
  );
};
