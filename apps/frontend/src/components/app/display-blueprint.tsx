import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import lua from "react-syntax-highlighter/dist/esm/languages/prism/lua";
import prism from "react-syntax-highlighter/dist/esm/styles/prism/duotone-dark";
SyntaxHighlighter.registerLanguage("lua", lua);

export default function DisplayBlueprint({ blueprint }: { blueprint: string }) {
  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-bold">Token Blueprint</legend>

      <div className="flex h-[20rem]">
        <SyntaxHighlighter
          language="lua"
          style={{ ...prism }}
          wrapLongLines={true}
        >
          {blueprint}
        </SyntaxHighlighter>
      </div>
    </fieldset>
  );
}
