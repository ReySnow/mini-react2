import { createFiber } from "./ReactFiber";
import { isArray, isStringNumber, Update } from "./utils";

// 协调
export function reconcileChildren(returnFiber, children) {
    if (isStringNumber(children)) {
        return
    }
    const newChildren = isArray(children) ? children : [children]
    // oldfiber 头节点
    let oldfiber = returnFiber.alternate?.child
    let previousNewFiber = null
    let newIndex = 0
    for (newIndex = 0; newIndex < newChildren.length; newIndex++) {
        const child = newChildren[newIndex];
        if (child == null) {
            continue
        }
        const newFiber = createFiber(child, returnFiber)
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
            deleteChild(returnFiber, oldfiber)
        }
        // oldfiber移动到下一个兄弟节点
        if (oldfiber) {
            oldfiber = oldfiber.sibling
        }
        if (previousNewFiber == null) {
            // 第一个子节点
            returnFiber.child = newFiber
        } else {
            // 是上一个节点的兄弟节点
            previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
    }

    // 新节点遍历完，但还有（多个）老节点，删除（多个）老节点
    if (newIndex === newChildren.length) {
        // 从剩下的老节点开始删除
        deleteRemainingChildren(returnFiber, oldfiber)
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

function deleteRemainingChildren(returnFiber, currentFirstChild) {
    let childToDelte = currentFirstChild
    while (childToDelte) {
        deleteChild(returnFiber, childToDelte)
        childToDelte = childToDelte.sibling// 下一个兄弟节点
    }
}

// 复用条件
function sameNode(a, b) {
    return a && b && a.type === b.type && a.key === b.key
}