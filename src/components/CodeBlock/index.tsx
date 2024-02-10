import Editor from "react-simple-code-editor";
import prism from "prismjs/components/prism-core";
import 'prismjs/components/prism-clike';
import "prismjs/components/prism-yaml";
import 'prismjs/components/prism-javascript';
import "prismjs/themes/prism-tomorrow.css";

const { highlight, languages } = prism;


type CodeBlockProps = {
  value: string,
  language: string,
}


export default function CodeBlock(props: CodeBlockProps) {
  const language = languages[props.language] || "yaml";
  if ( ! props.value ) return null;
  const highlight_ = (code: string) => {
    if (!! language ) return highlight(code, language);
    return code;
  }
  return (
    <Editor
      value={props.value}
      readOnly={true}
      onValueChange={() => {}}
      highlight={highlight_}
      style={{
        fontFamily: [
          "ui-monospace",
          "SFMono-Regular",
          '"SF Mono"',
          "Menlo",
          "Consolas",
          "Liberation Mono",
          '"Lucida Console"',
          "Courier",
          "monospace",
        ].join(","),
        textAlign: "initial",
      }}
    />
  )
}
