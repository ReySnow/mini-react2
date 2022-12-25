import { createFiber } from "./ReactFiber"
import { isArray, isStringNumber, updateNode } from "./utils"

// 原生标签
export function updateHostComponent(wip) {
    if (!wip.stateNode) {
        wip.stateNode = document.createElement(wip.type)
    }
    updateNode(wip.stateNode, wip.props)

    // 处理子节点
    reconsileChildren(wip, wip.props.children)
}

// 函数组件 函数返回值就是其子节点
export function updateFunctionComponent(wip) {
    const { type, props } = wip
    const children = type(props)
    reconsileChildren(wip, children)
}

export function updateClassComponent() { }

export function updateFragmentComponent() { }

export function updateHostTextComponent() { }

// 协调
function reconsileChildren(wip, children) {
    if (isStringNumber(children)) {
        return
    }
    const newChildren = isArray(children) ? children : [children]
    let previousNewFiber = null
    for (let i = 0; i < newChildren.length; i++) {
        const child = newChildren[i];
        if (child == null) {
            continue
        }
        const newFiber = createFiber(child, wip)
        if (previousNewFiber == null) {
            // 第一个子节点
            wip.child = newFiber
        } else {
            // 是上一个节点的兄弟节点
            previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
    }
}