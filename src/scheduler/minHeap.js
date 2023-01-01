// 获取最小堆堆顶的元素
export function peek(heap) {
    return heap.length === 0 ? null : heap[0]
}

// 往最小堆中插入元素
// 把node插入元素尾部
// 调整元素位置（向上调整）
export function push(heap, node) {
    let index = heap.length
    heap.push(node)
    siftUp(heap, node, index)
}

// 删除堆顶元素
// 将最后一个元素覆盖堆顶
// 向下调整
export function pop(heap) {
    if (heap.length === 0) {
        return null
    }
    let first = heap[0]
    let last = heap.pop()
    if (first !== last) {
        heap[0] = last
        siftDown(heap, last, 0)
    }
    return first
}

// 向上调整最小堆
function siftUp(heap, node, i) {
    let index = i
    while (index > 0) {
        let parentIndex = (index - 1) >> 1
        let parent = heap[parentIndex]
        if (compare(parent, node) > 0) {
            // parent > node 不符合最小堆
            swap(heap, parentIndex, index)
            index = parentIndex// 从父节点向上调整
        } else {
            return
        }
    }
}

// 向下调整
function siftDown(heap, node, i) {
    let index = i
    let halflen = heap.length >> 1
    while (index < halflen) {
        let leftIndex = (index + 1) * 2 - 1
        let rightIndex = leftIndex + 1
        let left = heap[leftIndex]
        let right = heap[rightIndex]
        if (compare(left, node) < 0) {
            // left < node
            if (right && compare(right, left) < 0) {
                // right最小
                swap(heap, index, rightIndex)
                index = rightIndex // 从子节点继续向下调整
            } else {
                // 没有right 或 left最小
                swap(heap, index, leftIndex)
                index = leftIndex
            }
        } else if (right && compare(right, node) < 0) {
            // right < node
            swap(heap, index, rightIndex)
            index = rightIndex
        } else {
            // parent最小
            return
        }
    }
}

function swap(heap, a, b) {
    [heap[a], heap[b]] = [heap[b], heap[a]]
}

function compare(a, b) {
    const diff = a.sortIndex - b.sortIndex
    return diff !== 0 ? diff : a.id - b.id
}

// const a = [3, 7, 4, 10, 12, 9, 6, 15, 14]
// push(a, 8)

// while (1) {
//     if (a.length == 0) {
//         break
//     }
//     console.log(peek(a));
//     pop(a)
// }