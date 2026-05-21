import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { getTasks, deleteTask, postTask } from './apis';
import './App.css';

function randomPos() {
  return {
    x: Math.random() * (window.innerWidth - 220),
    y: Math.random() * (window.innerHeight - 160) + 80,
  }
}

function App() {
  const [taskName, setTaskName] = useState('')
  const [tasks, setTasks] = useState({})
  const [completed, setCompleted] = useState({})
  const [positions, setPositions] = useState({})
  const [entering, setEntering] = useState({})
  const dragging = useRef(null)

  useEffect(() => {
    (async () => {
      const data = await getTasks()
      setTasks(data)
      const pos = {}
      Object.keys(data).forEach(id => { pos[id] = randomPos() })
      setPositions(pos)
    })()
  }, [])

  const handleSubmit = async () => {
    if (!taskName.trim()) return
    const task_id = uuidv4()
    const reqBody = { task_id, task_name: taskName }
    await postTask(reqBody)
    const data = await getTasks()
    setTasks(data)
    setPositions(prev => ({ ...prev, [task_id]: randomPos() }))
    setEntering(prev => ({ ...prev, [task_id]: true }))
    setTimeout(() => setEntering(prev => { const u = {...prev}; delete u[task_id]; return u }), 600)
  }

  const handleDelete = async (task_id) => {
    await deleteTask(task_id)
    const data = await getTasks()
    setTasks(data)
    setPositions(prev => { const u = {...prev}; delete u[task_id]; return u })
    setCompleted(prev => { const u = {...prev}; delete u[task_id]; return u })
  }

  const handleComplete = (task_id) => {
    setCompleted(prev => ({ ...prev, [task_id]: !prev[task_id] }))
  }

  const onMouseDown = (e, id) => {
    dragging.current = {
      id,
      startX: e.clientX - positions[id].x,
      startY: e.clientY - positions[id].y,
    }
  }

  const onMouseMove = (e) => {
    if (!dragging.current) return
    const { id, startX, startY } = dragging.current
    setPositions(prev => ({
      ...prev,
      [id]: { x: e.clientX - startX, y: e.clientY - startY }
    }))
  }

  const onMouseUp = () => { dragging.current = null }

  return (
    <div className="main" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <header className="title">
        <h1>✅ Todo Application</h1>
      </header>

      <div className='taskInputContainer'>
        <h3>Add New Task</h3>
        <div className='taskInput'>
          <input
            className='inputBox'
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

      {Object.keys(tasks).length === 0 &&
        <h2 className='noTasks'>No tasks yet. Add one above! 🎉</h2>
      }

      {Object.keys(tasks).map((item) => (
        positions[item] && (
          <div
            key={item}
            className={`bubble ${completed[item] ? 'done' : ''} ${entering[item] ? 'entering' : ''}`}
            style={{ left: positions[item].x, top: positions[item].y }}
            onMouseDown={(e) => onMouseDown(e, item)}
          >
            <div className='bubbleInner'>
              <p className='bubbleText'>
                {completed[item] && <span>✅ </span>}
                {tasks[item].taskName}
              </p>
              <div className='bubbleButtons'>
                <button className='completeButton' onClick={() => handleComplete(item)}>
                  {completed[item] ? 'Undo' : 'Done'}
                </button>
                <button className='deleteButton' onClick={() => handleDelete(item)}>
                  🗑
                </button>
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  );
}

export default App;
