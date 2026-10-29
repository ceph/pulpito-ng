
export default function Link(props) {
  return (
    <a
      href={props.to}
      target="_blank"
      rel="noopener noreferrer"
      color={props.color}
    >
      {props.children}
    </a>
  );
}
