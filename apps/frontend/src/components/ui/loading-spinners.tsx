export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-t-[3px] border-primary-foreground rounded-full" />
    </div>
  );
}
