
export default function Link(props) {
  return (
    <a
      href={props.to}
      target="_blank"
      color={props.color}
    >
      {props.children}
    </a>
  );
}
