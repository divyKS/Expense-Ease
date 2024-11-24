import { Hono } from "hono"

import { db } from "@/db/drizzle"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { groupMembers, groups, split_transactions, splits, users } from "@/db/schema"
import { eq, and } from 'drizzle-orm'


const app = new Hono()
    .post('/create-user',
        clerkMiddleware(),
        zValidator("json", z.object({ name: z.string().min(1, "Name is required") })),
        async (c) => {
            const auth = getAuth(c)

            if(!auth?.userId){
                return c.json({ error: "Unauthorized" }, 401)
            }

            const { name } = c.req.valid("json")

            const newUser = await db.insert(users).values({ name }).returning()

            return c.json(newUser[0], 201)
        })
    .get('/users',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)

            if (!auth?.userId) {
              return c.json({ error: "Unauthorized" }, 401)
            }

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
              const auth = getAuth(c)

              if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
              }

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
          const auth = getAuth(c)
      
          if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401)
          }
      
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
          const auth = getAuth(c)
      
          if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401)
          }
      
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
      .post(
        "/create",
        clerkMiddleware(),
        zValidator("json", z.object({
            groupId: z.number().int(),
            payerId: z.number().int(),
            totalAmount: z.number().int(),
            selectedUserIds: z.array(z.number().int()),
        })),
        async (c) => {
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const { groupId, payerId, totalAmount, selectedUserIds } = c.req.valid("json")

            try {
                const splitTransaction = await db
                    .insert(split_transactions)
                    .values({
                        payer_id: payerId,
                        group_id: groupId,
                        total_amount: totalAmount,
                    })
                    .returning()

                const transactionId = splitTransaction[0]?.transaction_id

                if (!transactionId) {
                    throw new Error("Failed to create split transaction")
                }

                selectedUserIds.push(payerId)

                const splitsData = selectedUserIds.map((userId) => ({
                    transaction_id: transactionId,
                    user_id: userId,
                    split_amount: Math.floor(totalAmount / selectedUserIds.length),
                    paid: userId === payerId,
                }))

                const allGroupMemberIds = [...selectedUserIds] 
                const unselectedUserIds = allGroupMemberIds.filter(
                    (userId) => !selectedUserIds.includes(userId)
                )

                unselectedUserIds.forEach((userId) => {
                    splitsData.push({
                    transaction_id: transactionId,
                    user_id: userId,
                    split_amount: 0,
                    paid: false,
                    })
                })

                const createdSplits = await db.insert(splits).values(splitsData).returning()

                return c.json({
                    splitTransaction,
                    splits: createdSplits,
                })
            } catch (error) {
                console.error(error)
                return c.json({ error: "Failed to create split" }, 500)
            }
        }
      )
      .get(
        "/group-splits",
        clerkMiddleware(),
        zValidator("query", z.object({ groupId: z.string() })),
        async (c) => {
          const auth = getAuth(c)
      
          if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401)
          }
      
          const { groupId } = c.req.valid("query")

          const numericGroupId = parseInt(groupId, 10)

        if (isNaN(numericGroupId)) {
        return c.json({ success: false, error: 'Invalid groupId' }, 400);
        }
      
          try {
            const splitsData = await db.select({
                splitId: splits.split_id,
                userId: splits.user_id,
                splitAmount: splits.split_amount,
                paid: splits.paid,
                userName: users.name,
                transactionId: split_transactions.transaction_id,
            })
            .from(splits)
            .innerJoin(users, eq(users.user_id, splits.user_id))
            .innerJoin(split_transactions, eq(split_transactions.transaction_id, splits.transaction_id))
            .where(eq(split_transactions.group_id, numericGroupId))
      
            return c.json({ data: splitsData })
          } catch (error) {
            console.error(error)
            return c.json({ error: "Failed to fetch splits" }, 500)
          }
        }
      )
      .patch(
        "/toggle-paid",
        clerkMiddleware(),
        zValidator(
          "json",
          z.object({
            splitId: z.number().int(),
            paid: z.boolean(),
          })
        ),
        async (c) => {
          const auth = getAuth(c)
      
          if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401)
          }
      
          const { splitId, paid } = c.req.valid("json")
      
          try {
            const updatedSplit = await db
              .update(splits)
              .set({ paid })
              .where(eq(splits.split_id, splitId))
              .returning()
      
            return c.json({ data: updatedSplit })
          } catch (error) {
            console.error(error)
            return c.json({ error: "Failed to update split status" }, 500)
          }
        }
      )
      .patch(
        "/toggle-transaction-status",
        clerkMiddleware(),
        zValidator(
          "json",
          z.object({
            transactionId: z.number().int(),
            status: z.enum(["pending", "complete"]), // New status to set
          })
        ),
        async (c) => {
          const auth = getAuth(c)
      
          if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401)
          }
      
          const { transactionId, status } = c.req.valid("json")
      
          try {
            const updatedTransaction = await db
              .update(split_transactions)
              .set({ status })
              .where(eq(split_transactions.transaction_id, transactionId))
              .returning()
      
            return c.json({ data: updatedTransaction })
          } catch (error) {
            console.error(error)
            return c.json({ error: "Failed to update transaction status" }, 500)
          }
        }
      )


export default app