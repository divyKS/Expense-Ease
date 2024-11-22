import { Hono } from "hono"

import { db } from "@/db/drizzle"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { groupMembers, groups, users } from "@/db/schema"
import { eq, and } from 'drizzle-orm'


const app = new Hono()
    .post('/create-user',
        clerkMiddleware(),
        zValidator("json", z.object({ name: z.string().min(1, "Name is required") })),
        async (c) => {
            // const auth = getAuth(c)

            // if(!auth?.userId){
            //     return c.json({ error: "Unauthorized" }, 401)
            // }

            const { name } = c.req.valid("json")

            const newUser = await db.insert(users).values({ name }).returning()

            return c.json(newUser[0], 201)
        })
    .get('/users',
        clerkMiddleware(),
        async (c) => {
            // const auth = getAuth(c)

            // if (!auth?.userId) {
            //   return c.json({ error: "Unauthorized" }, 401)
            // }

            const userList = await db.select().from(users)

            if (!userList) return c.json({ error: "Users not found." }, 404)

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
            //   const auth = getAuth(c)

            //   if (!auth?.userId) {
            //     return c.json({ error: "Unauthorized" }, 401)
            //   }

            const { name, userIds } = c.req.valid("json")

            const [createdGroup] = await db.insert(groups).values({ name }).returning()
            const membersData = userIds.map((userId) => ({
                group_id: createdGroup.group_id,
                user_id: userId,
            }))
            const addedMembers = await db.insert(groupMembers).values(membersData).returning()

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
    .get(
        "/group/:groupId/members",
        clerkMiddleware(),
        async (c) => {
            //   const auth = getAuth(c)

            //   if (!auth?.userId) {
            //     return c.json({ error: "Unauthorized" }, 401)
            //   }

            const groupId = parseInt(c.req.param("groupId"))

            if (isNaN(groupId)) {
                return c.json({ error: "Invalid group ID" }, 400)
            }

            try {
                const members = await db
                    .select({
                        user_id: groupMembers.user_id,
                        name: users.name,
                    })
                    .from(groupMembers)
                    .innerJoin(users, eq(users.user_id, groupMembers.user_id))
                    .where(eq(groupMembers.group_id, groupId))

                return c.json({ members })
            } catch (error) {
                console.error(error)
                return c.json({ error: "Failed to fetch group members" }, 500)
            }
        }
    )
    .post(
        "/group/:groupId/add-member",
        clerkMiddleware(),
        zValidator("json", z.object({
            userId: z.number().int(),
        })),
        async (c) => {
        //   const auth = getAuth(c)
      
        //   if (!auth?.userId) {
        //     return c.json({ error: "Unauthorized" }, 401)
        //   }
      
          const groupId = parseInt(c.req.param("groupId"))
          const { userId } = c.req.valid("json")
      
          if (isNaN(groupId)) {
            return c.json({ error: "Invalid group ID" }, 400)
          }
      
          try {
            const addedMember = await db
              .insert(groupMembers)
              .values({ group_id: groupId, user_id: userId })
              .returning()
      
            return c.json({ member: addedMember }, 201)
          } catch (error) {
            console.error(error)
            return c.json({ error: "Failed to add member to group" }, 500)
          }
        }
      )
      .delete(
        "/group/:groupId/remove-member",
        clerkMiddleware(),
        zValidator("json", z.object({
            userId: z.number().int(),
        })),
        async (c) => {
        //   const auth = getAuth(c)
      
        //   if (!auth?.userId) {
        //     return c.json({ error: "Unauthorized" }, 401)
        //   }
      
          const groupId = parseInt(c.req.param("groupId"))
          const { userId } = c.req.valid("json")
      
          if (isNaN(groupId)) {
            return c.json({ error: "Invalid group ID" }, 400)
          }
      
          try {
            const removedMember = await db
              .delete(groupMembers)
              .where(
                and(
                    eq(groupMembers.group_id, groupId),
                    eq(groupMembers.user_id, userId)
                )
              )
              .returning()
      
            return c.json({ removed: removedMember })
          } catch (error) {
            console.error(error)
            return c.json({ error: "Failed to remove member from group" }, 500)
          }
        }
      )


export default app