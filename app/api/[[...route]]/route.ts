import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/',  (c) => {
    return c.json({ message: "Root API Endpoint" })
})

app.get('/hello', (c) => {
    return c.json({
        message: 'Hello Next.js!',
    })
})

app.get(
    '/hello/:test', 
    zValidator('json', z.object({
        username: z.string().min(2)
    })),
    zValidator('param', z.object({
        test: z.string()
    })),
    (c) => {
        // const test = c.req.param('test')
        const { test } = c.req.valid('param')
        const { username } = c.req.valid('json')
        return c.json({ message: 'Test: ' + test })
    }
)

export const GET = handle(app)
export const POST = handle(app)