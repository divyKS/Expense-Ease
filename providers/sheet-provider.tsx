'use client'

import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet"
import { NewAccountSheet } from "@/features/accounts/components/NewAccountSheet"
import { EditCategorySheet } from "@/features/categories/components/edit-category-sheet"
import { NewCategorySheet } from "@/features/categories/components/NewCategorySheet"
import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet"
import { useMountedState } from "react-use"

export const SheetProvider = () => {

    const isMounted = useMountedState()

    if(!isMounted){
        return null
    }

    return (
        <>
            <NewAccountSheet />
            <EditAccountSheet />
            
            <NewCategorySheet />
            <EditCategorySheet />

            <NewTransactionSheet />
        </>
    )
}