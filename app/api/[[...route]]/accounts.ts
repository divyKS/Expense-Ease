import { Hono } from "hono"

import { db } from "@/db/drizzle"
import { accounts, insertAccountSchema } from "@/db/schema"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

const app = new Hono()
    .get('/',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)

            if(!auth?.userId){
                // when this is returned instead of the data below, react query doesn't destructure it in the hook use-get-accounts
                return c.json({ error: "Unauthorized" }, 401)
            }
            
            const data = await db.select({ id: accounts.id, name: accounts.name }).from(accounts).where(eq(accounts.userId, auth.userId))
            
            return c.json({ data })
        })
    .post('/',
        clerkMiddleware(),
        zValidator("json", insertAccountSchema.pick({ name: true })), // we only want one field from that schema
        async (c) => {
            const auth = getAuth(c)
            const values = c.req.valid('json')
            if(!auth?.userId){
                return c.json({ error: "Unauthorized" }, 401)
            }

            // sql would always return an array, even if it's a single document
            // so we can destructure to only get the first element
            const [data] = await db.insert(accounts).values({
                id: createId(),
                userId: auth.userId,
                ...values,
            }).returning() // by default select returns an object[], not insert
            // returning() returns the inserted records, helpful for getting autogenerated fields id, createdAt

            return c.json({ data })
        })

export default app