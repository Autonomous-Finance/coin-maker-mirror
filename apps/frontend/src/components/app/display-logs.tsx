export default function DisplayLogs({ logs }: { logs: string[] }) {
  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium">Logs</legend>
      <pre className="font-mono text-sm max-h-[24rem] overflow-auto">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </pre>
    </fieldset>
  );
}
