import { Hono } from "hono"

import { db } from "@/db/drizzle"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const app = new Hono()
    .get('/',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)

            if(!auth?.userId){
                return c.json({ error: "Unauthorized" }, 401)
            }
            
            return c.json({ data: "route setup done" }, 200)
        })

export default app