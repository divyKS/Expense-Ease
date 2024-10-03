'use client'

import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet"
import { NewAccountSheet } from "@/features/accounts/components/NewAccountSheet"
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
        </>
    )
}