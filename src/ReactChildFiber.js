import { createFiber } from "./ReactFiber";
import { isArray, isStringNumber, Placement, Update } from "./utils";

// 协调
export function reconcileChildren(returnFiber, children) {
    if (isStringNumber(children)) {
        return
    }
    const newChildren = isArray(children) ? children : [children]
    // oldfiber 头节点
    let oldfiber = returnFiber.alternate?.child
    // 下一个oldfiber  暂时缓存
    let nextOldFiber = null
    // 用于判断returnFiber是初次渲染还是更新
    let shouldTrackSideEffects = !!returnFiber.alternate
    let previousNewFiber = null
    let newIndex = 0
    // 上一次dom节点插入的最远位置
    let lastPlacedIndex = 0

    // 更新阶段 *1 从左往右遍历，比较新老节点，如果可以复用，继续往右，否则就停止
    for (; oldfiber && newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if (newChild == null) {
            continue
        }

        if (oldfiber.index > newIndex) {// 顺序乱了
            nextOldFiber = oldfiber// 暂存
            oldfiber = null
        } else {
            nextOldFiber = oldfiber.sibling
        }
        const newFiber = createFiber(newChild, returnFiber)
        const same = sameNode(newFiber, oldfiber)
        if (!same) {
            if (oldfiber === null) {
                oldfiber = nextOldFiber
            }
            break
        }

        Object.assign(newFiber, {
            stateNode: oldfiber.stateNode,
            alternate: oldfiber,
            flags: Update,
        })

        lastPlacedIndex = placeChild(
            newFiber,
            lastPlacedIndex,
            newIndex,
            shouldTrackSideEffects
        )

        if (previousNewFiber == null) {
            // 第一个子节点
            returnFiber.child = newFiber
        } else {
            // 是上一个节点的兄弟节点
            previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
        oldfiber = oldfiber.sibling
    }

    // *2 新节点遍历完，但还有（多个）老节点，删除（多个）老节点
    if (newIndex === newChildren.length) {
        // 从剩下的老节点开始删除
        deleteRemainingChildren(returnFiber, oldfiber)
        return
    }

    // *3 初次渲染
    // 老节点没了，新节点还有
    if (!oldfiber) {
        for (; newIndex < newChildren.length; newIndex++) {
            const child = newChildren[newIndex];
            if (child == null) {
                continue
            }
            const newFiber = createFiber(child, returnFiber)
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects)
            // let same = sameNode(newFiber, oldfiber)
            // if (same) {
            //     // 相同
            //     Object.assign(newFiber, {
            //         stateNode: oldfiber.stateNode,
            //         alternate: oldfiber,
            //         flags: Update,
            //     })
            // }
            // // 删除节点
            // if (!same && oldfiber) {
            //     deleteChild(returnFiber, oldfiber)
            // }
            // // oldfiber移动到下一个兄弟节点
            // if (oldfiber) {
            //     oldfiber = oldfiber.sibling
            // }
            if (previousNewFiber == null) {
                // 第一个子节点
                returnFiber.child = newFiber
            } else {
                // 是上一个节点的兄弟节点
                previousNewFiber.sibling = newFiber
            }

            previousNewFiber = newFiber
        }
    }

    // *4 新老节点都还有
    // 0 1 [2 3 4]
    // 0 1 [3 4]
    // 构建剩下old的hash表
    const existingChildren = mapRemainingChildren(oldfiber)
    // 遍历新节点， 通过key去hash中找节点，找到就复用，并删除hash中的节点
    for (; newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex]
        if (newChild === null) {
            continue
        }
        const newFiber = createFiber(newChild, returnFiber)
        const matchedFiber = existingChildren.get(newFiber.key || newFiber.index)
        if (matchedFiber) {
            // 复用
            Object.assign(newFiber, {
                stateNode: matchedFiber.stateNode,
                alternate: matchedFiber,
                flags: Update,
            })
            existingChildren.delete(newFiber.key || newFiber.index)
        }

        lastPlacedIndex = placeChild(
            newFiber,
            lastPlacedIndex,
            newIndex,
            shouldTrackSideEffects
        )
        if (previousNewFiber === null) {
            returnFiber.child = newFiber
        } else {
            previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
    }
    // *5old的hash还有，遍历hash删除所有old
    if (shouldTrackSideEffects) {
        existingChildren.forEach(child => deleteChild(returnFiber, child))
    }
}

function mapRemainingChildren(currentFirstChild) {
    const existingChildren = new Map()
    let existingChild = currentFirstChild
    while (existingChild) {
        existingChildren.set(
            existingChild.key || existingChild.index,
            existingChild
        )
        existingChild = existingChild.sibling
    }
    return existingChildren
}

// 初次渲染，记录下标
// 更新的时候检查节点是否移动
function placeChild(
    newFiber,
    lastPlacedIndex,
    newIndex,
    shouldTrackSideEffects
) {
    newFiber.index = newIndex
    if (!shouldTrackSideEffects) {
        // 父节点初次渲染
        return lastPlacedIndex
    }
    // 父节点更新
    const current = newFiber.alternate
    if (current) {
        // 子节点更新
        // old 0 1 2
        // new 2 1
        const oldIndex = current.index
        if (oldIndex < lastPlacedIndex) {// 到 1 了
            // 有节点移动
            newFiber.flags |= Placement
            return lastPlacedIndex
        } else {
            return oldIndex
        }
    } else {
        // 子节点初次渲染
        newFiber.flags |= Placement
        return lastPlacedIndex
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