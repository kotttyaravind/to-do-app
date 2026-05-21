import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { getTasks, deleteTask, postTask } from './apis';
import './App.css';

function randomPos() {
  return {
    x: Math.random() * (window.innerWidth - 260),
    y: Math.random() * (window.innerHeight - 260) + 80,
  }
}

function playPop(type = 'create') {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  if (type === 'create') {
    osc.frequency.setValueAtTime(520, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
  } else if (type === 'complete') {
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
  } else if (type === 'delete') {
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
  }

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)
}

function CloudBubble({ id, task, completed, entering, position, onMouseDown, onComplete, onDelete }) {
  return (
    <div
      className={`cloud ${completed ? 'done' : ''} ${entering ? 'entering' : ''}`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => onMouseDown(e, id)}
    >
      <div className="cloudShape">
        <div className="cloudBody">
          <p className="cloudText">
            {completed && <span>✅ </span>}
            {task.taskName}
          </p>
          <div className="cloudButtons">
            <button className="completeButton" onClick={() => onComplete(id)}>
              {completed ? 'Undo' : 'Done'}
            </button>
            <button className="deleteButton" onClick={() => onDelete(id)}>🗑</button>
          </div>
        </div>
      </div>
    </div>
  )
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

  useEffect(() => {
    const onUp = () => { dragging.current = null }
    const onMove = (e) => {
      if (!dragging.current) return
      const { id, startX, startY } = dragging.current
      setPositions(prev => ({
        ...prev,
        [id]: {
          x: Math.max(0, Math.min(window.innerWidth - 260, e.clientX - startX)),
          y: Math.max(70, Math.min(window.innerHeight - 200, e.clientY - startY)),
        }
      }))
    }
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const handleSubmit = async () => {
    if (!taskName.trim()) return
    const task_id = uuidv4()
    await postTask({ task_id, task_name: taskName })
    const data = await getTasks()
    setTasks(data)
    setPositions(prev => ({ ...prev, [task_id]: randomPos() }))
    setEntering(prev => ({ ...prev, [task_id]: true }))
    playPop('create')
    setTimeout(() => setEntering(prev => {
      const u = { ...prev }; delete u[task_id]; return u
    }), 700)
  }

  const handleDelete = async (task_id) => {
    playPop('delete')
    await deleteTask(task_id)
    const data = await getTasks()
    setTasks(data)
    setPositions(prev => { const u = { ...prev }; delete u[task_id]; return u })
    setCompleted(prev => { const u = { ...prev }; delete u[task_id]; return u })
  }

  const handleComplete = (task_id) => {
    playPop('complete')
    setCompleted(prev => ({ ...prev, [task_id]: !prev[task_id] }))
  }

  const onMouseDown = (e, id) => {
    e.preventDefault()
    dragging.current = {
      id,
      startX: e.clientX - positions[id].x,
      startY: e.clientY - positions[id].y,
    }
  }

  return (
    <div className="main">
      <header className="title">
        <h1>☁️ Todo Application</h1>
      </header>

      {Object.keys(tasks).length === 0 &&
        <h2 className='noTasks'>No tasks yet. Add one below! 🌤️</h2>
      }

      {Object.keys(tasks).map((item) => (
        positions[item] && (
          <CloudBubble
            key={item}
            id={item}
            task={tasks[item]}
            completed={completed[item]}
            entering={entering[item]}
            position={positions[item]}
            onMouseDown={onMouseDown}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        )
      ))}

      <div className='taskInputContainer'>
        <h3>✏️ Add New Task</h3>
        <div className='taskInput'>
          <input
            className='inputBox'
            type='text'
            placeholder='Enter task name...'
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={() => { handleSubmit(); setTaskName('') }} className='addButton'>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;
