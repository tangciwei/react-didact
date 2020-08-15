import { Didact } from "./Didact";
const element = (
  <div style="background: salmon">
    <h1>Hello World</h1>
    <h2 style="text-align:right">from Didact</h2>
    <h3 style="background:blue">
      <span>span!</span>
    </h3>
  </div>
);
console.log(element);
const container = document.getElementById("root");
Didact.render(element, container);
