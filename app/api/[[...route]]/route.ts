import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import accounts from './accounts'
import { HTTPException } from 'hono/http-exception'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

// app.route('/accounts', accounts)

const routes = app
    .route('/accounts', accounts)

// app.get('/',  (c) => ( c.json({ message: "Root API Endpoint" }) ))
// app.get(
//     '/hello',
//     clerkMiddleware(),
//     (c) => {
//         const auth = getAuth(c)
//         if(!auth?.userId){
//             return c.json({ error: 'Unauthorized' })
//         }
//         return c.json({ message: 'Hello Next.js!', userId: auth.userId })
//     }
// )

export const GET = handle(app)
export const POST = handle(app)

export type AppType = typeof routes

// export default app
// export type AppType = typeof routes