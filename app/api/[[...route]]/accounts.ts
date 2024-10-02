import { Hono } from "hono"

import { db } from "@/db/drizzle"
import { accounts } from "@/db/schema"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { HTTPException } from "hono/http-exception"
import { eq } from "drizzle-orm"

const app = new Hono()
    .get(
        '/',
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

export default app