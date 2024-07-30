export type Todo = {
    title: string,
    userId: number,
    completed: boolean,
}

export type TodoState = {
    todos: Todo[],
    status: null | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

export type TodoSliceState = {
    todo: TodoState
}

