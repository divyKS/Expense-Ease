'use client'

import { useGetAccounts } from "@/features/accounts/api/use-get-accounts"

export default function Home() {
    const { data, isLoading } = useGetAccounts() // data since that is what we return from the api/[[...routes]]/accounts.ts

    if(isLoading){
        return (
            <div>Loading...</div>
        )
    }
    return (
        <>
            <p>This is your dashboard, this is protected</p>
            <div>
                {data?.map((account) => (
                    <div key={account.id}>
                        {account.name}
                    </div>
                ))}
            </div>
        </>
    )
}
