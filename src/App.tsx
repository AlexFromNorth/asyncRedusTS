import {useEffect, useState} from 'react';

import { addNewTodo, fetchTodos } from './store/todoSlice';
import NewTodoForm from './components/NewTodoForm';
import TodoList from './components/TodoList';

import './App.css';
import { useDispatch, useSelector } from 'react-redux';


function App() {
  const [title, setTitle] = useState('');
  const {status, error} = useSelector(state => state.todos);

  const dispatch = useDispatch();

  const handleAction = () => {
    if(title.trim().length) {
      dispatch(addNewTodo(title));
      setTitle('');
    }
  }

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch])

  return (
    <div className='App'>123
      <NewTodoForm
        value={title}
        updateText={setTitle}
        handleAction={handleAction}
      />
      {status === 'loading' && <h2>Loading...</h2>}
      {error && <h2>An error occured: {error}</h2>}

      <TodoList />
    </div>
  );
}

export default App;
