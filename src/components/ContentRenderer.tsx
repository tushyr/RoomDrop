interface ContentRendererProps {
  content: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export default function ContentRenderer({ content }: ContentRendererProps) {
  if (!content) {
    return (
      <div className="flex-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-sm text-[var(--text-muted)] italic select-none">
        Nothing here yet…
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <div className="flex-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 text-base text-[var(--text)] overflow-y-auto break-words whitespace-pre-wrap select-text leading-relaxed">
      {lines.map((line, lineIdx) => {
        const parts = line.split(URL_REGEX);
        URL_REGEX.lastIndex = 0;
        return (
          <span key={lineIdx}>
            {parts.map((part, partIdx) => {
              if (/^https?:\/\/[^\s]+$/.test(part)) {
                return (
                  <a
                    key={partIdx}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--success)] underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    {part}
                  </a>
                );
              }
              return <span key={partIdx}>{part}</span>;
            })}
            {lineIdx < lines.length - 1 && "\n"}
          </span>
        );
      })}
    </div>
  );
}
