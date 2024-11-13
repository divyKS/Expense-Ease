import { zodResolver } from '@hookform/resolvers/zod'
import { Trash } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { insertTransactionSchema } from '@/db/schema'
import { Select } from '@/components/Select'
import { DatePicker } from '@/components/DatePicker'
import { Textarea } from '@/components/ui/textarea'
import { AmountInput } from '@/components/AmountInput'
import { convertAmountToMilliunits } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
	date: z.coerce.date(),
	accountId: z.string(),
	categoryId: z.string().nullable().optional(),
	payee: z.string(),
	amount: z.string(),
	notes: z.string().nullable().optional(),
	// recurring: z.boolean().optional()
	recurring: z.boolean().default(false)
})

const apiSchema = insertTransactionSchema.omit({
	id: true,
})

type FormValues = z.input<typeof formSchema>
type ApiFormValues = z.input<typeof apiSchema> & { recurring: boolean }

type TransactionFormProps = {
	id?: string,
	defaultValues?: FormValues,
	onSubmit: (values: ApiFormValues) => void,
	onDelete?: () => void,
	disabled?: boolean,
	accountOptions: { label: string, value: string }[],
	categoryOptions: { label: string, value: string }[],
	onCreateAccount: (name: string) => void,
	onCreateCategory: (name: string) => void,
}

export const TransactionForm = ({ id, defaultValues, onSubmit, onDelete, disabled, accountOptions, categoryOptions, onCreateAccount, onCreateCategory, }: TransactionFormProps) => {
    
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			...defaultValues,
			recurring: defaultValues?.recurring ?? false
		},
	})

	const handleSubmit = (values: FormValues) => {
        // console.log(values)
		const amount = parseFloat(values.amount)
		const amountInMilliunits = convertAmountToMilliunits(amount)

		onSubmit({
			...values,
			recurring: values.recurring ?? false,
			amount: amountInMilliunits,
		})
	}

	const handleDelete = () => {
		onDelete?.()
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				autoCapitalize="off"
				autoComplete="off"
				className="space-y-4 pt-4"
			>
				<FormField
					name="date"
					control={form.control}
					disabled={disabled}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<DatePicker
									value={field.value}
									onChange={field.onChange}
									disabled={disabled}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					name="accountId"
					control={form.control}
					disabled={disabled}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Account</FormLabel>

							<FormControl>
								<Select
									placeholder="Select an account"
									options={accountOptions}
									onCreate={onCreateAccount}
									value={field.value}
									onChange={field.onChange}
									disabled={disabled}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					name="categoryId"
					control={form.control}
					disabled={disabled}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>

							<FormControl>
								<Select
									placeholder="Select a category"
									options={categoryOptions}
									onCreate={onCreateCategory}
									value={field.value}
									onChange={field.onChange}
									disabled={disabled}
								/>
							</FormControl>

							<FormMessage />
						</FormItem> 
					)}
				/>

				<FormField
					name="payee"
					control={form.control}
					disabled={disabled}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Payee</FormLabel>

							<FormControl>
								<Input
									disabled={disabled}
									placeholder="Add a payee"
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					name="amount"
					control={form.control}
					disabled={disabled}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Amount</FormLabel>

							<FormControl>
								<AmountInput
									{...field}
									disabled={disabled}
									placeholder="0.00"
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					name="notes"
					control={form.control}
					disabled={disabled}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Notes</FormLabel>

							<FormControl>
								<Textarea
									{...field}
									value={field.value || ''}
									disabled={disabled}
									placeholder="Optional notes..."
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					name="recurring"
					control={form.control}
					render={({ field }) => (
						<FormItem>
							{/* <FormLabel>Recurring Expense</FormLabel> */}
							<FormControl>
							<div className="items-top flex space-x-2">
								<Checkbox
									id='recurring'
									checked={field.value ?? false}  // Set `checked` based on field value
									onCheckedChange={field.onChange} // Update field value on change
									disabled={disabled}
								/>
								<div className="grid gap-1.5 leading-none">
									<label
										htmlFor="terms1"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Recurring Expense
									</label>
								</div>
							</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button className="w-full" disabled={disabled}>
					{id ? 'Save changes' : 'Create transaction'}
				</Button>

				{!!id && (
					<Button
						type="button"
						disabled={disabled}
						onClick={handleDelete}
						className="w-full"
						variant="outline"
					>
						<Trash className="mr-2 size-4" />
						Delete transaction
					</Button>
				)}
			</form>
		</Form>
	)
}
