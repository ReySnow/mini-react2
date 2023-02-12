import { updateClassComponent, updateFragmentComponent, updateFunctionComponent, updateHostComponent, updateHostTextComponent } from "./ReactFiberReconciler";
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText } from "./ReactWorkTags";
import { scherduleCallback } from "./scheduler";
import { Placement, Update, updateNode } from "./utils";

let wip = null // 当前正在工做的fiber
let wipRoot = null // 根

// 初次渲染和更新
export function scheduleUpdateOnFiber(fiber) {
    wip = fiber
    wipRoot = fiber

    scherduleCallback(workLoop)
}

function workLoop() {
    // while (wip && IdleDeadline.timeRemaining() > 0) {
    while (wip) {
        preformUnitOfWork()
    }

    if (!wip && wipRoot) {
        commitRoot()
    }

    // requestIdleCallbsack(workLoop)
}

// requestIdleCallback(workLoop)

function preformUnitOfWork() {
    const { tag } = wip

    // 更新当前组件
    switch (tag) {
        case HostComponent:
            updateHostComponent(wip)
            break;
        case FunctionComponent:
            updateFunctionComponent(wip)
            break;
        case ClassComponent:
            updateClassComponent(wip)
            break;
        case HostText:
            updateHostTextComponent(wip)
            break;
        case Fragment:
            updateFragmentComponent(wip)
            break;
        default:
            break;
    }

    // 更新下一个 深度优先遍历
    // 开始查找下一个工作单元，首先从其子节点开始查找，
    // 然后找其兄弟节点，再找叔叔节点，依此推内。
    // 或者到根节点结束
    if (wip.child) {
        wip = wip.child
        return
    }
    let next = wip

    while (next) {
        if (next.sibling) {
            wip = next.sibling
            return
        }
        next = next.return
    }

    wip = null
}

// 提交
function commitRoot() {
    console.log(wipRoot);
    commitWorker(wipRoot)
    wipRoot = null
}

function commitWorker(fiber) {
    if (!fiber) {
        return
    }
    // 1 提交自己
    const { flags, stateNode } = fiber
    const parentNode = getParentNode(fiber.return)
    if (flags & Placement && stateNode) {
        const before = getHostSibling(fiber.sibling)
        insertOrAppendPlacementNode(stateNode, before, parentNode)
        // parentNode.appendChild(stateNode)
    }
    if (flags & Update && stateNode) {
        // 更新属性
        updateNode(stateNode, fiber.alternate.props, fiber.props)
    }

    if (fiber.deletions) {
        // 存在需要删除的
        commitDeletions(fiber.deletions, stateNode || parentNode)
    }
    // 2 提交子节点
    commitWorker(fiber.child)
    // 3 提交兄节点
    commitWorker(fiber.sibling)
}

// 获取父dom节点
function getParentNode(wip) {
    let temp = wip
    while (temp) {
        if (temp.stateNode) {
            return temp.stateNode
        }
        temp = temp.return
    }
}

// 删除子节点dom
function commitDeletions(deletions, parentNode) {
    for (let fiber of deletions) {
        parentNode.removeChild(getStateNode(fiber))
    }
}

// 不是每个fiber都有dom
// 找有dom的子节点
function getStateNode(fiber) {
    let tmp = fiber
    while (!tmp.stateNode) {
        tmp = tmp.child
    }
    return tmp.stateNode
}

// 获取下一个的dom,以便在这个dom前插入
function getHostSibling(sibling) {
    while (sibling) {
        // 有dom节点，且状态不是新增(新增的还没有插入页面中)
        if (sibling.stateNode && !(sibling.flags & Placement)) {
            return sibling.stateNode
        }
        sibling = sibling.sibling
    }
    return null
}

function insertOrAppendPlacementNode(stateNode, before, parentNode) {
    if (before) {
        parentNode.insertBefore(stateNode, before)
    } else {
        parentNode.appendChild(stateNode)
    }
}