const express = require('express')
const app = express()
const port = 4000
const fs = require('fs')

const DATA_FILE = '/app/data/tasks.json'

// Load tasks from file on startup
let tasks = {}
try {
  if (fs.existsSync(DATA_FILE)) {
    tasks = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  }
} catch (e) {
  tasks = {}
}

function saveTasks() {
  try {
    fs.mkdirSync('/app/data', { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to save tasks:', e)
  }
}

app.use(express.static('build'))
app.use(express.json())

app.get('/tasks', (req, res) => {
  res.send(tasks)
})

app.post('/tasks', (req, res) => {
  const requestBody = req.body
  tasks[requestBody.task_id] = {}
  tasks[requestBody.task_id].taskName = requestBody.task_name
  tasks[requestBody.task_id].status = "undone"
  saveTasks()
  res.send(tasks[requestBody.task_id])
})

app.delete('/tasks/:id', (req, res) => {
  const task_id = req.params.id
  delete tasks[task_id]
  saveTasks()
  res.send({})
})

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/build/index.html')
})

app.listen(port, () => {
  console.log(`Todo app listening at http://localhost:${port}`)
})
