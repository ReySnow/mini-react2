import { updateClassComponent, updateFragmentComponent, updateFunctionComponent, updateHostComponent, updateHostTextComponent } from "./ReactFiberReconciler";
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText } from "./ReactWorkTags";

let wip = null // 当前正在工做的fiber
let wipRoot = null // 根

// 初次渲染和更新
export function scheduleUpdateOnFiber(fiber) {
    wip = fiber
    wipRoot = fiber
}

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
}