interface ContentRendererProps {
  content: string;
  style?: React.CSSProperties;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const baseStyle: React.CSSProperties = {
  flex: 1,
  width: "100%",
  minHeight: "calc(100dvh - 200px)",
  padding: "24px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.09)",
  borderRadius: 16,
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  fontSize: "0.9375rem",
  lineHeight: 1.6,
};

/**
 * Renders plain text content with URLs automatically converted to clickable links.
 * Used for the read-only viewer mode in RoomEditor.
 */
export default function ContentRenderer({ content, style }: ContentRendererProps) {
  if (!content) {
    return (
      <div
        style={{
          ...baseStyle,
          color: "var(--text-muted)",
          fontStyle: "italic",
          ...style,
        }}
      >
        Nothing here yet…
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <>
      {/* Inline style for link hover — avoids inline event handlers and casting bugs */}
      <style>{`
        .cr-link {
          color: var(--text-primary);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(255,255,255,0.3);
          transition: text-decoration-color 0.15s ease;
          cursor: pointer;
        }
        .cr-link:hover {
          text-decoration-color: rgba(255,255,255,0.8);
        }
      `}</style>
      <div
        style={{
          ...baseStyle,
          color: "var(--text-secondary)",
          overflowY: "auto",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          userSelect: "text",
          ...style,
        }}
      >
        {lines.map((line, lineIdx) => {
          const parts = line.split(URL_REGEX);
          // Reset after split
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
