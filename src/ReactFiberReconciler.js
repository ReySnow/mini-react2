import { renderWithHooks } from "./hooks"
import { createFiber } from "./ReactFiber"
import { isArray, isStringNumber, Update, updateNode } from "./utils"

// 原生标签
export function updateHostComponent(wip) {
    if (!wip.stateNode) {
        wip.stateNode = document.createElement(wip.type)
    }
    updateNode(wip.stateNode, {}, wip.props)

    // 处理子节点
    reconcileChildren(wip, wip.props.children)
}

// 函数组件 函数返回值就是其子节点
export function updateFunctionComponent(wip) {
    renderWithHooks(wip)

    const { type, props } = wip
    const children = type(props)
    reconcileChildren(wip, children)
}

// 实例化class组件，调用render
export function updateClassComponent(wip) {
    const { type, props } = wip
    const instance = new type(props)
    const children = instance.render()
    reconcileChildren(wip, children)
}

export function updateFragmentComponent(wip) {
    console.log(wip);
    reconcileChildren(wip, wip.props.children)
}

export function updateHostTextComponent(wip) {
    wip.stateNode = document.createTextNode(wip.props.children)
}

// 协调
function reconcileChildren(wip, children) {
    if (isStringNumber(children)) {
        return
    }
    const newChildren = isArray(children) ? children : [children]
    // oldfiber 头节点
    let oldfiber = wip.alternate?.child
    let previousNewFiber = null
    for (let i = 0; i < newChildren.length; i++) {
        const child = newChildren[i];
        if (child == null) {
            continue
        }
        const newFiber = createFiber(child, wip)
        let same = sameNode(newFiber, oldfiber)
        if (same) {
            // 相同
            Object.assign(newFiber, {
                stateNode: oldfiber.stateNode,
                alternate: oldfiber,
                flags: Update,
            })
        }
        // 删除节点
        if (!same && oldfiber) {
            deleteChild(wip, oldfiber)
        }
        // oldfiber移动到下一个兄弟节点
        if (oldfiber) {
            oldfiber = oldfiber.sibling
        }
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

// 将要删除的节点保存到父节点上
function deleteChild(returnFiber, child) {
    if (returnFiber.deletions) {
        returnFiber.deletions.push(child)
    } else {
        returnFiber.deletions = [child]
    }
}

// 复用条件
function sameNode(a, b) {
    return a && b && a.type === b.type && a.key === b.key
}