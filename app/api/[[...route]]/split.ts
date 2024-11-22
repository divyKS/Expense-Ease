import { Hono } from "hono"

import { db } from "@/db/drizzle"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { groupMembers, groups, users } from "@/db/schema"

const app = new Hono()
    .post('/create-user',
        clerkMiddleware(),
        zValidator("json", z.object({name: z.string().min(1, "Name is required")})),
        async (c) => {
            // const auth = getAuth(c)

            // if(!auth?.userId){
            //     return c.json({ error: "Unauthorized" }, 401)
            // }

            const { name } = c.req.valid("json")

            const newUser = await db.insert(users).values({name}).returning()
            
            return c.json(newUser[0], 201)
        })
    .get('/users',
        clerkMiddleware(),
        async (c) => {
            // const auth = getAuth(c);
        
            // if (!auth?.userId) {
            //   return c.json({ error: "Unauthorized" }, 401);
            // }
        
            const userList = await db.select().from(users)

            if(!userList)  return c.json({ error: "Users not found." }, 404)
        
            return c.json(userList, 200)
        }
    )
    .post(
        "/create-group",
        clerkMiddleware(),
        zValidator(
          "json",
          z.object({
            name: z.string().min(1, "Group name is required"),
            userIds: z.array(z.number().int()).nonempty("At least one user must be selected"),
          })
        ),
        async (c) => {
        //   const auth = getAuth(c);
      
        //   if (!auth?.userId) {
        //     return c.json({ error: "Unauthorized" }, 401);
        //   }
      
          const { name, userIds } = c.req.valid("json");

          const [createdGroup] = await db.insert(groups).values({ name }).returning()
          const membersData = userIds.map((userId) => ({
            group_id: createdGroup.group_id,
            user_id: userId,
          }))
          const addedMembers = await db.insert(groupMembers).values(membersData).returning();

          return c.json({
              group: createdGroup,
              members: addedMembers,
            }, 201)


    //    await db.transaction(async (trx) => {
    //         const [createdGroup] = await trx.insert(groups).values({ name }).returning()
    //         await trx.insert(groupMembers).values(membersData)
    //     })

        
        }
      )


export default app