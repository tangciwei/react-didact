# react 原理学习

- fiber 数据结构，将执行过程分层一份一份的，这样就不会阻塞 ui 渲染，所以要在上面记录一些信息，3 个指针；
- Reconciliation，指的是更新时，去 diff。函数执行也在这个阶段，这里也包括 useState 的执行。
- commit 阶段，真正更新 dom。3 种情况的区别

## fiber 数据结构
原因方便找下一个 fiber/上一个
One of the goals of this data structure is to make it easy to find the next unit of work. That’s why each fiber has a link to its first child, its next sibling and its parent.
优先 child/sibling/parent

## Reconciliation 阶段

1. 首次+更新，先构造 fiber 数据结构，顺便得到 diff 数据，每次要做的事情是（当前 dom 生成，首次），diff children 得到数据；
2. 最后 commitRoot, 根据 diff 的数据，进行相应更新。
3. 新增 dom
4. 删除 dom
5. 属性
   1. 删除旧属性/事件
   2. 新增新属性/事件
6. 再次归零，旧的 currentRoot 和 wipRoot

## 函数和 hooks 机制

- 函数，无非就是让其执行一次；
- 中间有 useState 时，执行就会有闭包，闭包里面放着 hook，当下次 setState 时，会将更新事件放入 hook 的队列里面，然后下次 render 时，就会执行队列里面的函数。
- 这当中，每个函数多个 useState 区分完全是靠 index。

## 其他资料

- toyReact :
  https://segmentfault.com/a/1190000023616070
