'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNewAccount } from "@/features/accounts/hooks/use-new-accounts"
import { Plus } from "lucide-react"
import { columns, Payment } from "./columns"
import { DataTable } from "@/components/DataTable"

const data: Payment[] = [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 120,
      status: "success",
      email: "a@example.com",
    },
    {
      id: "728ed52f",
      amount: 10,
      status: "failed",
      email: "z@example.com",
    },
]

const AccountsPage = () => {
    const newAccount = useNewAccount()
  
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
                    <DataTable columns={columns} data={data} filterKey="email"/>
                </CardContent>
            </Card>
        </div>
    )
}

export default AccountsPage