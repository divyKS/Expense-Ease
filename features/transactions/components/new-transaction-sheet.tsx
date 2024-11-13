import { Loader2 } from "lucide-react"
import { z } from "zod"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { insertTransactionSchema } from "@/db/schema"
import { useCreateAccount } from "@/features/accounts/api/use-create-account"
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts"
import { useCreateCategory } from "@/features/categories/api/use-create-category"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useCreateTransaction } from "@/features/transactions/api/use-create-transaction"
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction"
import { TransactionForm } from "./transaction-form"
import { useBulkCreateTransactions } from "../api/use-bulk-create-transactions"
import { addMonths, endOfMonth } from "date-fns"


const formSchema = insertTransactionSchema.omit({ id: true }).extend({
  recurring: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

export const NewTransactionSheet = () => {
  const { isOpen, onClose } = useNewTransaction()

  const categoryQuery = useGetCategories()
  const categoryMutation = useCreateCategory()
  
  const onCreateCategory = (name: string) => categoryMutation.mutate({ name })

  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }))
  
  const accountQuery = useGetAccounts()
  const accountMutation = useCreateAccount()
  const onCreateAccount = (name: string) => accountMutation.mutate({ name })
  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }))
  
  const createMutation = useCreateTransaction()

  const createRecurringTransactions = useBulkCreateTransactions()

  const isPending = createMutation.isPending || categoryMutation.isPending || accountMutation.isPending
  
  const isLoading = categoryQuery.isLoading || accountQuery.isLoading

  const onSubmit = (values: FormValues) => {
    // console.log(values)

    const { date, recurring, ...transactionData } = values

    // If not recurring, create a single transaction
    if (!recurring) {
      createMutation.mutate(values, { onSuccess: onClose })
      return
    }

    const transactions = Array.from({ length: 12 }).map((_, index) => {
      const futureDate = addMonths(date, index + 1)
  
      // Adjust if the original date was the 31st or other non-existent day in some months
      const adjustedDate = date.getDate() > 28 ? endOfMonth(futureDate) : futureDate
  
      return { ...transactionData, date: adjustedDate }
    })

    console.log(transactions)
  
    // Bulk create all 12 transactions
    createRecurringTransactions.mutate(transactions, { onSuccess: onClose });
    
    // createMutation.mutate(values, {
    //   onSuccess: () => {
    //     onClose()
    //   },
    // })
  }

  return (
    <Sheet open={isOpen || isPending} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>

          <SheetDescription>Add a new transaction.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TransactionForm
            onSubmit={onSubmit}
            disabled={isPending}
            categoryOptions={categoryOptions}
            onCreateCategory={onCreateCategory}
            accountOptions={accountOptions}
            onCreateAccount={onCreateAccount}
          />
        )}
      
      </SheetContent>
    </Sheet>
  )
}
