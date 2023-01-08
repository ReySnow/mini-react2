import { renderWithHooks } from "./hooks"
import { reconcileChildren } from "./ReactChildFiber"
import { updateNode } from "./utils"

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
