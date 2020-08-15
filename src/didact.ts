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
type DOM = Text | Element;


// ----------------------------

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
    } as VDom;
}
// ----------------------------
interface Fiber {
    props: Props;
    type?: ElementType
    dom?: DOM | null;
    parent?: Fiber
    child?: Fiber
    sibling?: Fiber
}

function createDom(fiber: Fiber): DOM {
    const dom =
        fiber.type == "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type) as Element

    const isProperty = (key: string) => key !== "children"
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            // @ts-ignore
            dom[name] = fiber.props[name]
        })
    return dom
}

let nextUnitOfWork: Fiber | undefined | null = null
let wipRoot: Fiber | null = null

function render(element: VDom, container: DOM) {

    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
    }
    nextUnitOfWork = wipRoot
}

function commitRoot() {
    commitWork(wipRoot.child)
    wipRoot = null
}

function commitWork(fiber: Fiber) {
    if (!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}


function workLoop(deadline: Deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)


function performUnitOfWork(fiber: Fiber): Fiber | undefined {
    // 第一步，创建dom
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    // 去掉，最后一次性做
    // if (fiber.parent) {
    //     fiber.parent.dom.appendChild(fiber.dom)
    // }
    // 第二步，children遍历
    const elements = fiber.props.children as VDom[];
    let index = 0
    let prevSibling: Fiber = null

    while (index < elements.length) {
        const element = elements[index]

        const newFiber: Fiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
    // 第三步
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

export const Didact = {
    createElement,
    render,
};
