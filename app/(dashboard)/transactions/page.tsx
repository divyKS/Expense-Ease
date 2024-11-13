'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react"
import { DataTable } from "@/components/DataTable"
import { Skeleton } from "@/components/ui/skeleton"
import { columns } from "./columns"
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction"
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions"
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions"
import { useEffect, useState } from "react"
import { UploadButton } from "./upload-button"
import { ImportCard } from "./import-card"
import { transactions as transactionSchema } from "@/db/schema"
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account"
import { toast } from "sonner"
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions"


enum VARIANTS {
    LIST = "LIST",
    IMPORT = "IMPORT"
}

// from docs of react-papaparse, that's how the data is returned
const INITIAL_IMPORT_RESULTS = {
    data: [],
    errors: [],
    meta: {}
}

const TransactionsPage = () => {

    const [AccountDialog, confirm] = useSelectAccount()

    const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST)
    const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS)

    const newTransaction = useNewTransaction()
    const createTransactions = useBulkCreateTransactions()
    const transactionQuery = useGetTransactions()
    const deleteTransactions = useBulkDeleteTransactions()
    const transactions = transactionQuery.data || []

    const isDisabled = transactionQuery.isLoading || deleteTransactions.isPending
    
    const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
        console.log(results) // a matrix of string[][] with data, error, meta field - papaparse thing
        setImportResults(results)
        setVariant(VARIANTS.IMPORT)
    }

    const onCancelImport = () => {
        setImportResults(INITIAL_IMPORT_RESULTS)
        setVariant(VARIANTS.LIST)
    }

    const onSubmitImport = async (values: typeof transactionSchema.$inferInsert[]) => {
        const accountId = await confirm()
        if(!accountId){
            return toast.error("Please select an account to continue.")
        }

        const data = values.map((value) => ({
            ...value,
            accountId: accountId as string
        }))

        console.log(data)

        // accountId: "account_2"
        // amount: -13270
        // date: "2024-01-08"
        // payee: "Shop"

        createTransactions.mutate(data, {
            onSuccess: () => {
                onCancelImport()
            }
        })
    }

    // useEffect(() => {
    //     if(transactions.length){
    //         console.log(transactions)
    //     }
    // }, [transactions])

    if(transactionQuery.isLoading){
        return (
            <div className="mx-auto max-w-screen-2xl w-full  -mt-6 pb-10">
                <Card className="border-none drop-shadow-sm">
                    <CardHeader>
                        <Skeleton className="h-8 w-48"/>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px] w-full flex items-center justify-center">
                            <Loader2 className="size-6 text-slate-300 animate-spin"/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (variant === VARIANTS.IMPORT) {
        return (
            <>
                <AccountDialog />    
                <ImportCard
                  data={importResults.data}
                  onCancel={onCancelImport}
                  onSubmit={onSubmitImport}
                />
            </>
        )
    }

    return (
        <div className="mx-auto max-w-screen-2xl w-full  -mt-6 pb-10"> {/* mx-auto max-w-screen-2xl so that on too large screen we stay in middle*/}
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="line-clamp-1 text-xl">Transaction History</CardTitle>
                    <div className="flex flex-col items-center gap-x-2 gap-y-2 lg:flex-row">
                        <Button size="sm" onClick={newTransaction.onOpen} className="w-full lg:w-auto">
                            <Plus className="mr-2 size-4" /> Add new
                        </Button>
                        <UploadButton onUpload={onUpload} />
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        filterKey="payee"
                        columns={columns}
                        data={transactions}
                        disabled={isDisabled}
                        onDelete={(row) => {
                            const ids = row.map((r) => r.original.id)
                            deleteTransactions.mutate({ids})
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default TransactionsPage