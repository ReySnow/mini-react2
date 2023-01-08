import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop"

// 当前的fiber
let currentlyRenderingFiber = null
let workInProgressHook = null

export function renderWithHooks(wip) {
    currentlyRenderingFiber = wip
    currentlyRenderingFiber.memorizedState = null
    workInProgressHook = null
}

function updateWorkInProgressHook() {
    let hook
    // 老的
    const current = currentlyRenderingFiber.alternate
    if (current) {
        // 更新
        currentlyRenderingFiber.memorizedState = current.memorizedState
        if (workInProgressHook) {
            // 本次hook是上次hook的next
            workInProgressHook = hook = workInProgressHook.next
        } else {
            // 第一个hook
            workInProgressHook = hook = currentlyRenderingFiber.memorizedState
        }
    } else {
        // 初次渲染
        hook = {
            memorizedState: null,
            next: null
        }
        if (workInProgressHook) {
            // 挂载到上一个hook的next
            workInProgressHook = workInProgressHook.next = hook
        } else {
            // 第一个hook
            workInProgressHook = currentlyRenderingFiber.memorizedState = hook
        }
    }
    return hook
}

export function useReducer(reducer, initalState) {
    let hook = updateWorkInProgressHook()
    if (!currentlyRenderingFiber.alternate) {
        // 初次渲染
        hook.memorizedState = initalState
    }
    // const dispatch = () => {
    //     // 根据上一次状态获取新的状态
    //     hook.memorizedState = reducer(hook.memorizedState)
    //     currentlyRenderingFiber.alternate = { ...currentlyRenderingFiber }
    //     scheduleUpdateOnFiber(currentlyRenderingFiber)
    //     console.log('dispatch');
    // }
    // 保存 currentlyRenderingFiber 到上下文 
    // 否则在调用dispatch的时候 currentlyRenderingFiber 不是当前组件的fiber
    const dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, hook, reducer)
    return [hook.memorizedState, dispatch]
}

export function useState(initalState) {
    return useReducer(null, initalState)
}

function dispatchReducerAction(fiber, hook, reducer, action) {
    // 根据上一次状态获取新的状态
    hook.memorizedState = reducer ? reducer(hook.memorizedState) : action
    fiber.alternate = { ...fiber }
    fiber.sibling = null// ？ 不更新兄弟节点
    scheduleUpdateOnFiber(fiber)
    console.log('dispatch');
}