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

const TransactionsPage = () => {
    const newTransaction = useNewTransaction()
    const transactionQuery = useGetTransactions()
    const deleteTransactions = useBulkDeleteTransactions()
    const transactions = transactionQuery.data || []

    const isDisabled = transactionQuery.isLoading || deleteTransactions.isPending

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

    return (
        <div className="mx-auto max-w-screen-2xl w-full  -mt-6 pb-10"> {/* mx-auto max-w-screen-2xl so that on too large screen we stay in middle*/}
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="line-clamp-1 text-xl">Transaction History</CardTitle>
                    <Button size="sm" onClick={newTransaction.onOpen}>
                        <Plus className="mr-2 size-4" /> Add new
                    </Button>
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