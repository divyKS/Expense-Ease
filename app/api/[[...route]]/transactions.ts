import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { zValidator } from '@hono/zod-validator'
import { createId } from '@paralleldrive/cuid2'
import { parse, subDays } from 'date-fns'
import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'

import { db } from '@/db/drizzle'
import {
	accounts,
	categories,
	insertTransactionSchema,
	transactions,
} from '@/db/schema'

const app = new Hono()
	.get(
		'/',
		//to filter by date and account id if we want to on home page
		zValidator(
			'query',
			z.object({
				from: z.string().optional(),
				to: z.string().optional(),
				accountId: z.string().optional(),
			})
		),
		clerkMiddleware(),
		async (c) => {
			const auth = getAuth(c)
			const { from, to, accountId } = c.req.valid('query')

			if (!auth?.userId) {
				return c.json({ error: 'Unauthorized.' }, 401)
			}

			const defaultTo = new Date()
			const defaultFrom = subDays(defaultTo, 30)

			const startDate = from
				? parse(from, 'yyyy-MM-dd', new Date())
				: defaultFrom

			const endDate = to
				? parse(to, 'yyyy-MM-dd', new Date())
				: defaultTo

			const data = await db
				.select({
					id: transactions.id,
					date: transactions.date,
					category: categories.name,
					categoryId: transactions.categoryId, // what will we do with just id on frontend
					payee: transactions.payee,
					amount: transactions.amount,
					notes: transactions.notes,
					account: accounts.name,
					accountId: transactions.accountId,
				})
				.from(transactions)
				.innerJoin(accounts, eq(transactions.accountId, accounts.id)) // since we want both sides of relations to exist, we don't want transactions which don't have accountId
				.leftJoin(
					categories,
					eq(transactions.categoryId, categories.id)
				) // in case a category doesn't exist we will still load the transaction
				.where(
					and(
						accountId
							? eq(transactions.accountId, accountId)
							: undefined,
						eq(accounts.userId, auth.userId), //555
						gte(transactions.date, startDate),
						lte(transactions.date, endDate)
					)
				)
				.orderBy(desc(transactions.date))

			return c.json({ data })
		}
	)
	.get(
		'/:id',
		zValidator(
			'param',
			z.object({
				id: z.string().optional(),
			})
		),
		clerkMiddleware(),
		async (c) => {
			const auth = getAuth(c)
			const { id } = c.req.valid('param')

			if (!id) {
				return c.json({ error: 'Missing id.' }, 400)
			}

			if (!auth?.userId) {
				return c.json({ error: 'Unauthorized.' }, 401)
			}

			const [data] = await db // category name, account name can be now fetched by the form where this is rendered
				.select({
					id: transactions.id,
					date: transactions.date,
					categoryId: transactions.categoryId,
					payee: transactions.payee,
					amount: transactions.amount,
					notes: transactions.notes,
					accountId: transactions.accountId,
				})
				.from(transactions)
				.innerJoin(accounts, eq(transactions.accountId, accounts.id))
				.where(
					and(
						eq(transactions.id, id),
						eq(accounts.userId, auth.userId)
					)
				)

			if (!data) {
				return c.json({ error: 'Not found.' }, 404)
			}

			return c.json({ data })
		}
	)
	.post(
		'/',
		clerkMiddleware(),
		zValidator(
			'json',
			insertTransactionSchema.omit({
				id: true,
			})
		),
		async (c) => {
			const auth = getAuth(c)
			const values = c.req.valid('json')

			if (!auth?.userId) {
				return c.json({ error: 'Unauthorized.' }, 401)
			}

			const [data] = await db
				.insert(transactions)
				.values({
					id: createId(),
					...values,
				})
				.returning()

			return c.json({ data })
		}
	)
	.post(
		'/bulk-create',
		clerkMiddleware(),
		zValidator('json', z.array(insertTransactionSchema.omit({ id: true }))),
		async (c) => {
			// this to import from csv
			const auth = getAuth(c)
			const values = c.req.valid('json')

			if (!auth?.userId) {
				return c.json({ error: 'Unauthorized.' }, 401)
			}

			// console.log(values)

			const data = await db
				.insert(transactions)
				.values(
					values.map((value) => ({
						id: createId(),
						...value,
					}))
				)
				.returning()
			
			// console.log({data}) 
			// TODO: see here for the cancelling recurring payments, this return can be used to have to id's of the transactions, then those can be stored with their dates, on cancelling the transactions that belong to recurring transaction db? would be removed which are ahead of the current date

			return c.json({ data })
		}
	)
	.post(
		'/bulk-delete',
		clerkMiddleware(),
		zValidator('json', z.object({ ids: z.array(z.string()) })),
		async (c) => {
			const auth = getAuth(c)
			const values = c.req.valid('json')

			if (!auth?.userId) {
				return c.json({ error: 'Unauthorized.' }, 401)
			}

			// we can not directly have inside the where to match the deleting accounts with matching ids, that's complex
			// WITH DELETE clause ,from docs
			// and this is powerful operation, we can't let the user bulk delete whatever

			const transactionsToDelete = db.$with('transactions_to_delete').as(
				db
					.select({ id: transactions.id })
					.from(transactions)
					.innerJoin(
						accounts,
						eq(transactions.accountId, accounts.id)
					)
					.where(
						and(
							inArray(transactions.id, values.ids),
							eq(accounts.userId, auth.userId)
						)
					)
			)

			const data = await db
				.with(transactionsToDelete)
				.delete(transactions)
				.where(
					inArray(
						transactions.id,
						sql`(SELECT id FROM ${transactionsToDelete})`
					)
				)
				.returning({
					id: transactions.id,
				})

			return c.json({ data })
		}
	)
	.patch(
		'/:id',
		clerkMiddleware(),
		zValidator('param', z.object({ id: z.string().optional() })),
		zValidator('json', insertTransactionSchema.omit({ id: true })),
		async (c) => {
			const auth = getAuth(c)
			const { id } = c.req.valid('param')
			const values = c.req.valid('json')

			if (!id) {
				return c.json({ error: 'Missing id.' }, 400)
			}

			if (!auth?.userId) {
				return c.json({ error: 'Unauthorized.' }, 401)
			}

			// transactions don't belong to the user, we have do this deep query to find those
			const transactionsToUpdate = db.$with('transactions_to_update').as(
				db
					.select({ id: transactions.id })
					.from(transactions)
					.innerJoin(
						accounts,
						eq(transactions.accountId, accounts.id)
					)
					.where(
						and(
							eq(transactions.id, id),
							eq(accounts.userId, auth.userId)
						)
					)
			)

			const [data] = await db
				.with(transactionsToUpdate)
				.update(transactions)
				.set(values)
				.where(
					inArray(
						transactions.id,
						sql`(SELECT id FROM ${transactionsToUpdate})`
					)
				)
				.returning()

			if (!data) {
				return c.json({ error: 'Not found.' }, 404)
			}

			return c.json({ data })
		}
	)
	.delete(
		'/:id',
		clerkMiddleware(),
		zValidator('param', z.object({ id: z.string().optional() })),
		async (c) => {
			const auth = getAuth(c)
			const { id } = c.req.valid('param')

			if (!id) {
				return c.json({ error: 'Missing id.' }, 400)
			}

			if (!auth?.userId) {
				return c.json({ error: 'Unauthorized.' }, 401)
			}

			const transactionsToDelete = db.$with('transactions_to_delete').as(
				db
					.select({ id: transactions.id })
					.from(transactions)
					.innerJoin(
						accounts,
						eq(transactions.accountId, accounts.id)
					)
					.where(
						and(
							eq(transactions.id, id),
							eq(accounts.userId, auth.userId)
						)
					)
			)

			const [data] = await db
				.with(transactionsToDelete)
				.delete(transactions)
				.where(
					inArray(
						transactions.id,
						sql`(SELECT id FROM ${transactionsToDelete})`
					)
				)
				.returning({
					id: transactions.id,
				})

			if (!data) {
				return c.json({ error: 'Not found.' }, 404)
			}

			return c.json({ data })
		}
	)

export default app
