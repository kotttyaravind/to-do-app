import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { getTasks, deleteTask, postTask } from './apis';
import './App.css';

function App() {
  const [taskName, setTaskName] = useState('')
  const [tasks, setTasks] = useState({})
  const [completed, setCompleted] = useState({})

  useEffect(() => {
    (async () => {
      const data = await getTasks()
      setTasks(data)
    })()
  }, [])

  const handleSubmit = async () => {
    if (!taskName.trim()) return
    const reqBody = {
      task_id: uuidv4(),
      task_name: taskName,
    }
    await postTask(reqBody)
    const data = await getTasks()
    setTasks(data)
  }

  const handleDelete = async (task_id) => {
    await deleteTask(task_id)
    const data = await getTasks()
    setTasks(data)
    setCompleted(prev => {
      const updated = { ...prev }
      delete updated[task_id]
      return updated
    })
  }

  const handleComplete = (task_id) => {
    setCompleted(prev => ({ ...prev, [task_id]: !prev[task_id] }))
  }

  return (
    <div className="main">
      <header className="title">
        <h1>✅ Todo Application</h1>
      </header>

      <div className='taskInputContainer'>
        <h3>Add New Task</h3>
        <div className='taskInput'>
          <input
            className='inputBox'
            id='task-name-input'
            type='text'
            placeholder='Enter task name'
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={() => { handleSubmit(); setTaskName('') }} className='addButton'>
            Add
          </button>
        </div>
      </div>

      <div className='tasks'>
        {Object.keys(tasks).length === 0
          ? <h2 className='noTasks'>No pending tasks. Enjoy!! 🎉</h2>
          : Object.keys(tasks).map((item) => (
            <div key={item} className={`taskItem ${completed[item] ? 'done' : ''}`}>
              <span className='taskName'>
                {completed[item] && <span className='tick'>✅ </span>}
                {tasks[item].taskName}
              </span>
              <div className='taskButtons'>
                <button
                  className='completeButton'
                  onClick={() => handleComplete(item)}
                >
                  {completed[item] ? 'Undo' : 'Complete'}
                </button>
                <button
                  className='deleteButton'
                  onClick={() => handleDelete(item)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
