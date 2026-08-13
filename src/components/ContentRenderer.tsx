interface ContentRendererProps {
  content: string;
  style?: React.CSSProperties;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * Renders plain text content with URLs automatically converted to clickable links.
 * Used for the read-only viewer mode in RoomEditor.
 */
export default function ContentRenderer({ content, style }: ContentRendererProps) {
  if (!content) {
    return (
      <div
        className="cozy-card flex-1 w-full p-4 sm:p-6 text-sm sm:text-base font-ui text-[var(--text-muted)] italic flex items-center justify-center"
        style={style}
      >
        Nothing here yet…
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <>
      <style>{`
        .cr-link {
          color: var(--code-badge-text);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(74, 222, 128, 0.4);
          transition: text-decoration-color 0.15s ease, color 0.15s ease;
          cursor: pointer;
        }
        .cr-link:hover {
          color: #86EFAC;
          text-decoration-color: #86EFAC;
        }
      `}</style>
      <div
        className="cozy-card flex-1 w-full p-4 sm:p-6 text-sm sm:text-base font-ui text-[var(--text-primary)] overflow-y-auto break-words whitespace-pre-wrap select-text leading-relaxed"
        style={style}
      >
        {lines.map((line, lineIdx) => {
          const parts = line.split(URL_REGEX);
          URL_REGEX.lastIndex = 0;
          return (
            <span key={lineIdx}>
              {parts.map((part, partIdx) => {
                const isUrl = /^https?:\/\/[^\s]+$/.test(part);
                if (isUrl) {
                  return (
                    <a
                      key={partIdx}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cr-link"
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
    </>
  );
}
