import { createFiber } from "./ReactFiber";
import { isArray, isStringNumber, Update } from "./utils";

// 协调
export function reconcileChildren(wip, children) {
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