import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)

            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const {
                title,
                description,
            } = req.body

            if (!title || !description) {
                return res.writeHead(400).end(JSON.stringify({ message: 'Invalid payload' }))
            }

            const now = new Date()

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: now,
                updated_at: now
            }

            database.insert('tasks', task)

            return res.writeHead(201).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end(JSON.stringify({ message: 'Task not found' }))
            }

            const isTaskCompleted = !!task.completed_at
            const completedAt = isTaskCompleted ? null : new Date()

            database.update('tasks', id, { completed_at: completedAt })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            if (!title && !description) {
                return res.writeHead(400).end(JSON.stringify({ message: 'Invalid payload' }))
            }

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end(JSON.stringify({ message: 'Task not found' }))
            }

            database.update('tasks', id, {
                title: title ?? task.title,
                description: description ?? task.description,
                updated_at: new Date()
            })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end(JSON.stringify({ message: 'Task not found' }))
            }

            database.delete('tasks', id)

            return res.writeHead(204).end()
        }
    }
]
