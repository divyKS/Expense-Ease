import { Hono } from "hono"

import { db } from "@/db/drizzle"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { users } from "@/db/schema"

const app = new Hono()
    .post('/create-user',
        clerkMiddleware(),
        zValidator("json", z.object({name: z.string().min(1, "Name is required")})),
        async (c) => {
            const auth = getAuth(c)

            if(!auth?.userId){
                return c.json({ error: "Unauthorized" }, 401)
            }

            const { name } = c.req.valid("json")

            const newUser = await db.insert(users).values({name}).returning()
            
            return c.json(newUser[0], 201)
        })
    .get('/users',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
        
            if (!auth?.userId) {
              return c.json({ error: "Unauthorized" }, 401);
            }
        
            const userList = await db.select().from(users)

            if(!userList)  return c.json({ error: "Users not found." }, 404)
        
            return c.json(userList, 200)
        }
    )
    

export default app