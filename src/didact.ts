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

interface Fiber {
    props: Props;
    type?: ElementType
    dom?: DOM | null;
    parent?: Fiber
    child?: Fiber
    sibling?: Fiber
    alternate?: Fiber
    effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION'
}
// ----------------------------

function createElement(type: ElementType, props: Props, ...children: Props['children']): VDom {
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

function createTextElement(text: string): VDom {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    } as VDom;
}

function createDom(fiber: Fiber): DOM {
    const dom =
        fiber.type == "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type) as Element

    updateDom(dom, {} as Props, fiber.props)
    return dom
}

// ----------------------
// 入口
requestIdleCallback(workLoop)

let nextUnitOfWork: Fiber | undefined | null = null
let wipRoot: Fiber | null = null
let currentRoot: Fiber | null = null
let deletions: Fiber[] = []

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

function performUnitOfWork(fiber: Fiber): Fiber | undefined {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    const elements = fiber.props.children
    reconcileChildren(fiber, elements as VDom[])

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

function reconcileChildren(wipFiber: Fiber, elements: VDom[]) {

    let index = 0
    let oldFiber: Fiber =
        wipFiber.alternate && wipFiber.alternate.child
    let prevSibling: Fiber = null

    while (
        index < elements.length ||
        oldFiber != null
    ) {
        const element = elements[index]
        let newFiber: Fiber = null

        const sameType =
            oldFiber &&
            element &&
            element.type == oldFiber.type

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }
        if (element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if (index === 0) {
            wipFiber.child = newFiber
        } else if (element) {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
}

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    // 恢复
    currentRoot = wipRoot
    wipRoot = null
}


function commitWork(fiber: Fiber) {
    if (!fiber) {
        return
    }
    const domParent = fiber.parent.dom

    if (
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom)
    }
    else if (fiber.effectTag === "DELETION") {
        domParent.removeChild(fiber.dom)
    }
    else if (
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
    ) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    }

    commitWork(fiber.child)
    commitWork(fiber.sibling)

}


const isNew = (prev: Props, next: Props) => (key: string) =>
    prev[key] !== next[key]
const isGone = (prev: Props, next: Props) => (key: string) => !(key in next)

const isEvent = (key: string) => key.startsWith("on")
const isProperty = (key: string) =>
    key !== "children" && !isEvent(key)

function updateDom(dom: DOM, prevProps: Props, nextProps: Props) {
    //Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key =>
                !(key in nextProps) ||
                isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.removeEventListener(
                eventType,
                prevProps[name]
            )
        })

    // Remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            (dom as any)[name] = ""
        })

    // Set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            (dom as any)[name] = nextProps[name]
        })

    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })

}

function render(element: VDom, container: DOM) {

    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot
    }
    deletions = [];
    nextUnitOfWork = wipRoot
}
export const Didact = {
    createElement,
    render,
};
