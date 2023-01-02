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

export function updateNode(node, prevVal, nextVal) {
    Object.keys(prevVal)
        // .filter(k => k !== "children")
        .forEach((k) => {
            if (k === "children") {
                // 有可能是文本
                if (isStringNumber(prevVal[k])) {
                    node.textContent = "";
                }
            } else if (k.slice(0, 2) === "on") {
                const eventName = k.slice(2).toLocaleLowerCase();
                node.removeEventListener(eventName, prevVal[k]);
            } else {
                if (!(k in nextVal)) {
                    node[k] = "";
                }
            }
        });
    Object.keys(nextVal)
        // .filter(k => k !== "children")
        .forEach((k) => {
            if (k === "children") {
                // 有可能是文本
                if (isStringNumber(nextVal[k])) {
                    node.textContent = nextVal[k] + "";
                }
            } else if (k.slice(0, 2) === "on") {
                // shijan
                const eventName = k.slice(2).toLocaleLowerCase();
                node.addEventListener(eventName, nextVal[k]);
            } else {
                node[k] = nextVal[k];
            }
        });
}