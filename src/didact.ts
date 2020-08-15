declare var requestIdleCallback: {
    (callback: {
        (deadline: Deadline): void;
    }): void;
}
interface Deadline {
    timeRemaining(): number
}

type ElementType = string | "TEXT_ELEMENT";
interface Props {
    [key: string]: any;
    children: (VDom | string)[];
}

interface VDom {
    type: ElementType;
    props: Props;
}

// -------------

function createElement(type: ElementType, props: Props, ...children: Props['children']) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) =>
                typeof child === "object" ? child : createTextElement(child)
            ),
        },
    };
}

function createTextElement(text: string) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
}

function render(element: VDom, container: Text | HTMLElement) {
    const dom =
        element.type == "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(element.type);
    const isProperty = (key) => key !== "children";
    Object.keys(element.props)
        .filter(isProperty)
        .forEach((name) => {
            dom[name] = element.props[name];
        });
    element.props.children.forEach((child: VDom) => render(child, dom));
    container.appendChild(dom);
}


let nextUnitOfWork = null
function workLoop(deadline: Deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
    // TODO
}



export const Didact = {
    createElement,
    render,
};
