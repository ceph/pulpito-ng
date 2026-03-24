import { RichTextarea } from "rich-textarea";
import { Highlight } from "prism-react-renderer"
import "prismjs/themes/prism-tomorrow.css";

import "./index.css";

const emptyTheme = { plain: {}, styles: [] };


type CodeBlockProps = {
  value: string,
  language: string,
}

export default function CodeBlock(props: CodeBlockProps) {
  if (!props.value) return null;
  function render(value: string) {
    return (
      <Highlight
        code={value}
        language={props.language}
        theme={emptyTheme}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <div className={className} style={style}>
            {tokens.map((line, i) => {
              const props = getLineProps({ line });
              return (
                <div key={i} {...props}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              )
            }
            )}
          </div>
        )}
      </Highlight>
    )
  }
  return (
    <RichTextarea
      value={props.value}
      onChange={() => { }}
      autoHeight
      disabled={true}
      style={{
        width: "100%",
        fontFamily: "monospace",
        cursor: "text",
      }}
    >
      {render}
    </RichTextarea>
  )
}
