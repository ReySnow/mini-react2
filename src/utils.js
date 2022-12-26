// flags
export const NoFlages = 0b0000;
// 新增、插入
export const Placement = 0b0010;
// 更新
export const Update = 0b0100;
// 删除
export const Deletion = 0b1000;

export function isStr(s) {
    return typeof s === 'string'
}

export function isStringNumber(s) {
    return typeof s === 'string' || typeof s === 'number'
}

export function isFn(fn) {
    return typeof fn === 'function'
}

export function isUndefined(s) {
    return s === undefined
}

export function isArray(val) {
    return Array.isArray(val)
}

export function updateNode(node, nextVal) {
    Object.keys(nextVal).forEach(k => {
        if (k === 'children') {
            if (isStringNumber(nextVal[k])) {
                node.textContent = nextVal[k]
            }
        } else {
            node[k] = nextVal[k]
        }
    })
}