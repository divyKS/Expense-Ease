import { z } from 'zod'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from '@/components/ui/sheet'
import { insertCategorySchema } from '@/db/schema'
import { useOpenCategory } from '../hooks/use-open-category'
import { Loader2 } from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'
import { CategoryForm } from './CategoryForm'
import { useEditCategory } from '../api/use-edit-category'
import { useDeleteCategory } from '../api/use-delete-category'
import { useGetCategory } from '../api/use-get-category'

const formSchema = insertCategorySchema.pick({
	name: true,
})

type FormValues = z.infer<typeof formSchema>

export const EditCategorySheet = () => {
	const { isOpen, onClose, id } = useOpenCategory()

	const categoryQuery = useGetCategory(id)

	const isLoading = categoryQuery.isLoading

	const editMutation = useEditCategory(id)
	
	const deleteMutation = 	useDeleteCategory(id)

	const [ConfirmDialog, confirm] = useConfirm('Are you sure?', 'You are about to delete this category')
	
	const isPending = editMutation.isPending || deleteMutation.isPending // so that user can not spam api requests after one request

	const onDelete = async () => {
		const ok = await confirm()
		if(ok){
			deleteMutation.mutate(undefined, {
				onSuccess: () => {
					onClose()
				}
			})
		}
	}

	const onSubmit = (values: FormValues) => {
		editMutation.mutate(values, {
			onSuccess: () => {
				onClose()
			},
		})
	}

	const defaultValues = categoryQuery.data ? { name: categoryQuery.data.name } : { name: "" }

	return (
		<>
			<ConfirmDialog />
			<Sheet open={isOpen || isPending} onOpenChange={onClose}>
				<SheetContent className="space-y-4">
					<SheetHeader>
						<SheetTitle>Edit Category</SheetTitle>

						<SheetDescription>
							Edit an existing category
						</SheetDescription>
					</SheetHeader>

					{isLoading ? (
						<div className='absolute inset-0 flex items-center justify-center'>
							<Loader2 className='size-4 animate-spin text-muted-foreground'/>
						</div>
					) : (
						<CategoryForm
							id={id}
							defaultValues={defaultValues}
							onSubmit={onSubmit}
							disabled={isPending}
							// onDelete={() => deleteMutation.mutate()}
							onDelete={onDelete}
						/>
					)}
				</SheetContent>
			</Sheet>
		</>
	)
}
