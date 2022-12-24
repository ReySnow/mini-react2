import { createFiber } from "./ReactFiber"
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop"

function ReactDOMRoot(internalRoot) {
    this._internalRoot = internalRoot

}

ReactDOMRoot.prototype.render = function (children) {
    const root = this._internalRoot
    updateContainer(children, root)
}

function updateContainer(element, root) {
    const { containerInfo } = root
    const fiber = createFiber(element, {
        type: containerInfo.nodeName.toLocaleLowerCase(),
        stateNode: containerInfo,
    })

    // 组件初次渲染
    scheduleUpdateOnFiber(fiber)
}

function createRoot(container) {
    const root = {
        containerInfo: container
    }
    return new ReactDOMRoot(root)
}



export default { createRoot }