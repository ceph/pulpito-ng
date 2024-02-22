import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import 'prismjs/components/prism-clike';
import "prismjs/components/prism-yaml";
import 'prismjs/components/prism-javascript';

export default function CodeBlock(props) {
  const language = languages[props.language];
  if ( ! props.value ) return null;
  return (
    <Editor
      value={props.value}
      readOnly={true}
      highlight={(code) => {
        if (!! language ) return highlight(code, language);
        return code;
      }}
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
