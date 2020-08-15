import { Didact } from "./Didact";

function App(props) {
  return <h1>Hi {props.name}</h1>;
}
const element = <App name="foo" />;
console.log(element)
const container = document.getElementById("root");
Didact.render(element, container);
