export default function IconLink(props) {
  return (
    <a href={props.to} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
      {props.children}
    </a>
  );
}
