'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNewAccount } from "@/features/accounts/hooks/use-new-accounts"
import { Loader2, Plus } from "lucide-react"
import { columns } from "./columns"
import { DataTable } from "@/components/DataTable"
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts"
import { Skeleton } from "@/components/ui/skeleton"
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete"


const AccountsPage = () => {
    const newAccount = useNewAccount()
    const accountQuery = useGetAccounts()
    const deleteAccounts = useBulkDeleteAccounts()
    const accounts = accountQuery.data || []

    const isDisabled = accountQuery.isLoading || deleteAccounts.isPending

    if(accountQuery.isLoading){
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
                    <CardTitle className="line-clamp-1 text-xl">Accounts Page</CardTitle>
                    <Button size="sm" onClick={newAccount.onOpen}>
                        <Plus className="mr-2 size-4" /> Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={accounts}
                        filterKey="account"
                        disabled={isDisabled}
                        onDelete={(row) => {
                            const ids = row.map((r) => r.original.id)
                            deleteAccounts.mutate({ids})
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default AccountsPage