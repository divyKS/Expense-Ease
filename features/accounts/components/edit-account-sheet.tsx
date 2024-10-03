import { z } from 'zod'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from '@/components/ui/sheet'
import { insertAccountSchema } from '@/db/schema'
import { AccountForm } from './AccountForm'
import { useOpenAccount } from '../hooks/use-open-account'
import { useGetAccount } from '../api/use-get-account'
import { Loader2 } from 'lucide-react'
import { useEditAccount } from '../api/use-edit-account'

const formSchema = insertAccountSchema.pick({
	name: true,
})

type FormValues = z.infer<typeof formSchema>

export const EditAccountSheet = () => {
	const { isOpen, onClose, id } = useOpenAccount()

	const accountQuery = useGetAccount(id)

	const isLoading = accountQuery.isLoading

	const editMutation = useEditAccount(id)
	const isPending = editMutation.isPending

	const onSubmit = (values: FormValues) => {
		editMutation.mutate(values, {
			onSuccess: () => {
				onClose()
			},
		})
	}

	const defaultValues = accountQuery.data ? { name: accountQuery.data.name } : { name: "" }

	return (
		<Sheet open={isOpen || isPending} onOpenChange={onClose}>
			<SheetContent className="space-y-4">
				<SheetHeader>
					<SheetTitle>Edit Account</SheetTitle>

					<SheetDescription>
						Edit an existing account
					</SheetDescription>
				</SheetHeader>

				{isLoading ? (
					<div className='absolute inset-0 flex items-center justify-center'>
						<Loader2 className='size-4 animate-spin text-muted-foreground'/>
					</div>
				) : (
					<AccountForm
						id={id}
						defaultValues={defaultValues}
						onSubmit={onSubmit}
						disabled={isPending}
					/>
				)}
			</SheetContent>
		</Sheet>
	)
}
