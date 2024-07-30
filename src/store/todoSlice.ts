import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Todo, TodoState } from "../types/types";

export const fetchTodos = createAsyncThunk<
  Todo[],
  undefined,
  { rejectValue: string }
>("todos/fetchTodos", async function (_, { rejectWithValue }) {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=10"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }
    return (await response.json()) as Todo;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
});

export const deleteTodo = createAsyncThunk<
  Todo,
  string,
  { rejectValue: string; state: { todos: TodoState } }
>("todos/deleteTodo", async function (id, { rejectWithValue, dispatch }) {
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete todo");
    }
    // удаление из локальной копии
    dispatch(removeTodo({ id }));
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
});

export const toggleStatus = createAsyncThunk<
  Todo,
  string,
  { rejectValue: string; state: { todos: TodoState } }
>(
  "todos/toggleStatus",
  async function (id, { rejectWithValue, dispatch, getState }) {
    try {
      const todo = getState().todos.todos.find((todo) => todo.id === id);
      if (todo) {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/todos/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              completed: !todo.completed,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to toggle status");
        }
        dispatch(toggleComplete({ id }));
      }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const addNewTodo = createAsyncThunk<
  Todo,
  string,
  { rejectValue: string }
>("todos/addNewTodo", async function (title, { rejectWithValue, dispatch }) {
  try {
    const todo = {
      title,
      userId: 1,
      completed: false,
    };
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });

    if (!response.ok) {
      throw new Error("Failed to add new todo");
    }
    const data = await response.json();
    console.log(data);
    dispatch(addTodo(todo));
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
});

const setError = (state, action) => {
  state.status = "failed";
  state.error = action.payload;
  console.log("failed");
};

const initialState: TodoState = {
  todos: [],
  status: null,
  error: null,
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo(state, action) {
      state.todos.push(action.payload);
    },
    toggleComplete(state, action) {
      const toggledTodo = state.todos.find(
        (todo) => todo.id === action.payload.id
      );
      toggledTodo.completed = !toggledTodo.completed;
    },
    removeTodo(state, action) {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload.id);
    },
  },
  extraReducers: (builder) => {
    builder
      // pending
      .addCase(fetchTodos.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(addNewTodo.pending, (state) => {
        state.error = null;
      })
      // fulfilled
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.todos = action.payload;
      })
      // reject
      .addCase(fetchTodos.rejected, setError)
      .addCase(deleteTodo.rejected, setError)
      .addCase(toggleStatus.rejected, setError)
      .addCase(addNewTodo.rejected, setError);
  },
});

export const { addTodo, toggleComplete, removeTodo } = todoSlice.actions;

export default todoSlice.reducer;
