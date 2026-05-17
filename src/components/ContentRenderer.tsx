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
        style={{
          flex: 1,
          width: "100%",
          minHeight: "calc(100dvh - 200px)",
          padding: "24px",
          background: "rgba(255,255,255,0.01)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          color: "var(--text-muted)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
          fontFamily: "\"JetBrains Mono\", \"Fira Code\", Consolas, monospace",
          fontSize: "0.9375rem",
          lineHeight: 1.6,
          fontStyle: "italic",
          ...style,
        }}
      >
        Nothing here yet…
      </div>
    );
  }

  // Split content into lines, then within each line split on URLs
  const lines = content.split("\n");

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        minHeight: "calc(100dvh - 200px)",
        padding: "24px",
        background: "rgba(255,255,255,0.01)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        color: "var(--text-secondary)",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
        fontFamily: "\"JetBrains Mono\", \"Fira Code\", Consolas, monospace",
        fontSize: "0.9375rem",
        lineHeight: 1.6,
        overflowY: "auto",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        userSelect: "text",
        ...style,
      }}
    >
      {lines.map((line, lineIdx) => {
        const parts = line.split(URL_REGEX);
        return (
          <span key={lineIdx}>
            {parts.map((part, partIdx) => {
              if (URL_REGEX.test(part)) {
                // Reset regex lastIndex (important — split shares state)
                URL_REGEX.lastIndex = 0;
                return (
                  <a
                    key={partIdx}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-primary)",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      textDecorationColor: "rgba(255,255,255,0.3)",
                      transition: "text-decoration-color 0.15s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLAnchorElement).style.textDecorationColor = "rgba(255,255,255,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLAnchorElement).style.textDecorationColor = "rgba(255,255,255,0.3)";
                    }}
                  >
                    {part}
                  </a>
                );
              }
              URL_REGEX.lastIndex = 0;
              return <span key={partIdx}>{part}</span>;
            })}
            {/* Preserve newlines — add <br> for all lines except the last */}
            {lineIdx < lines.length - 1 && "\n"}
          </span>
        );
      })}
    </div>
  );
}
