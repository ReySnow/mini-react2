import { peek, pop, push } from "./minHeap";

let taskQueue = []
let taskIdCounter = 1;

export function scherduleCallback(callback) {
    const currentTime = getCurrentTime()
    let timeout = -1// 等待时间
    let expirtationTime = currentTime + timeout

    // 任务
    const newTask = {
        id: taskIdCounter++,
        callback,
        expirtationTime,
        sortIndex: expirtationTime
    }
    push(taskQueue, newTask)

    // 请求调度
    requestHostCallback()
}

function getCurrentTime() {
    return performance.now()
}

function requestHostCallback() {
    port.postMessage(null)
}

const channel = new MessageChannel()
const port = channel.port2
channel.port1.onmessage = function () {
    workLoop()
}

function workLoop() {
    let currentTask = peek(taskQueue)
    while (currentTask) {
        const callback = currentTask.callback
        currentTask.callback = null// 防止重复执行
        callback()// 执行任务
        pop(taskQueue)// 从任务池中抛出
        currentTask = peek(taskQueue)// 继续执行
    }
}