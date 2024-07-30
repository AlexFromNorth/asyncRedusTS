import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async function (_, { rejectWithValue }) {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos?_limit=10"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async function (id, { rejectWithValue, dispatch }) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${id}`,
        {
          method: "DELETE",
        }
      );
      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }
      // удаление из локальной копии
      dispatch(removeTodo({ id }));
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.message);
    }
  }
);

export const toggleStatus = createAsyncThunk(
  "todos/toggleStatus",
  async function (id, { rejectWithValue, dispatch, getState }) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !getState().todos.todos.find((todo) => todo.id === id)
              .completed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle status");
      }

      dispatch(toggleComplete({ id }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewTodo = createAsyncThunk(
    'todos/addNewTodo',
    async function (title, {rejectWithValue, dispatch}){
        try{
            const todo = {
                title,
                userId: 1,
                completed: false,
            }
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(todo)
            })

            if(!response.ok){
                throw new Error("Failed to add new todo")
            }
            const data = await response.json()
            console.log(data)
            dispatch(addTodo(todo));


        }catch(error){
            return rejectWithValue(error.message)
        }
    }
)




const setError = (state, action) => {
  state.status = "failed";
  state.error = action.payload;
  console.log("failed");
};

const todoSlice = createSlice({
  name: "todos",
  initialState: {
    todos: [],
    status: null,
    error: null,
  },
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
        console.log("loading todos");
      })
      .addCase(deleteTodo.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(toggleStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addNewTodo.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // fulfilled
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.todos = action.payload;
        console.log("succeeded");
      })
      // reject
      .addCase(fetchTodos.rejected, setError)
      .addCase(deleteTodo.rejected, setError)
      .addCase(toggleStatus.rejected, setError)
      .addCase(addNewTodo.rejected, setError)
  },
});

export const { addTodo, toggleComplete, removeTodo } = todoSlice.actions;

export default todoSlice.reducer;
