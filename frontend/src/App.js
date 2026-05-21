import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { getTasks, deleteTask, postTask } from './apis';
import './App.css';

function randomPos() {
  const isMobile = window.innerWidth <= 768
  const w = isMobile ? 160 : 280
  const h = isMobile ? 120 : 210
  return {
    x: Math.random() * (window.innerWidth - w),
    y: Math.random() * (window.innerHeight - h - 120) + 60,
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
const fillColor = completed
  ? 'rgba(60,180,90,0.75)'
  : 'rgba(255,200,200,0.82)'
const strokeColor = completed
  ? 'rgba(30,140,60,0.85)'
  : 'rgba(255,150,150,0.6)'

  return (
    <div
      className={`cloud ${completed ? 'done' : ''} ${entering ? 'entering' : ''}`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => onMouseDown(e, id)}
      onTouchStart={(e) => onMouseDown(e.touches[0], id)}
    >
      <svg
        viewBox="0 0 200 150"
        xmlns="http://www.w3.org/2000/svg"
        className="cloudSvg"
      >
        <defs>
          <filter id={`glass-${id}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feOffset dx="0" dy="3" result="offsetBlur"/>
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
          </filter>
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,220,220,0.95)"/>
            <stop offset="100%" stopColor={fillColor}/>
          </linearGradient>
        </defs>

        {/* Main cloud path - organic bumpy shape like the image */}
        <path
          d="
            M 100,130
            C 70,130 45,125 35,112
            C 20,112 8,100 8,86
            C 8,76 14,68 23,64
            C 20,58 20,50 25,44
            C 30,36 40,32 50,34
            C 52,24 60,16 72,14
            C 82,12 92,16 98,24
            C 104,16 114,12 125,15
            C 137,18 145,28 144,40
            C 152,38 162,44 165,54
            C 168,62 164,72 157,77
            C 166,82 172,92 170,103
            C 168,116 156,124 143,125
            C 135,128 118,130 100,130 Z
          "
          fill={`url(#grad-${id})`}
          stroke={strokeColor}
          strokeWidth="2"
          filter={`url(#glass-${id})`}
          style={{backdropFilter: 'blur(12px)'}}
        />

        {/* Shine highlight */}
        <path
          d="M 55,30 C 65,20 85,18 95,26"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Little tail like speech bubble */}
        <path
          d="M 130,128 C 138,138 148,142 145,130"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
      </svg>

      {/* Content overlaid on SVG */}
      <div className="cloudContent">
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
  )
}

function App() {
  const [taskName, setTaskName] = useState('')
  const [tasks, setTasks] = useState({})
  const [completed, setCompleted] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('completedTasks')) || {}
  } catch { return {} }
})
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
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  const isMobile = window.innerWidth <= 768
  const w = isMobile ? 160 : 300
  const h = isMobile ? 120 : 200

  setPositions(prev => ({
    ...prev,
    [id]: {
      x: Math.max(
        0,
        Math.min(window.innerWidth - w, clientX - startX)
      ),
      y: Math.max(
        58,
        Math.min(window.innerHeight - h - 110, clientY - startY)
      ),
    }
  }))
}
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchend', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('touchmove', onMove)
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
  setCompleted(prev => {
    const updated = { ...prev, [task_id]: !prev[task_id] }
    localStorage.setItem('completedTasks', JSON.stringify(updated))
    return updated
  })
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

      <div className="bubblesContainer">
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
      </div>

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
