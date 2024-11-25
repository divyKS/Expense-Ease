'use client'

import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewGroupSheet } from "@/features/splits/components/new-group-sheet"
import { NewUserSheet } from "@/features/splits/components/new-user-sheet"
import { useNewGroup } from "@/features/splits/hooks/use-new-group"
import { useNewUser } from "@/features/splits/hooks/use-new-user"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

const SplitPage = () => {
    const { onOpen } = useNewUser()
    const { onOpen: onOpenGroup } = useNewGroup()
    
    const [groups, setGroups] = useState([])

    // Fetch groups from the API
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                console.log("dbeidbei")
                const response = await axios.get("/api/split/groups") // Replace with your API endpoint
                setGroups(response.data)
            } catch (error) {
                console.error("Error fetching groups:", error)
            }
        }

        fetchGroups()
    }, [])

    return (
        <div className="mx-auto max-w-screen-2xl w-full  -mt-6 pb-10">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="line-clamp-1 text-xl">Split Page</CardTitle>
                    <div className="flex gap-x-2">
                        <Button size="sm" onClick={onOpenGroup}>
                            <Plus className="mr-2 size-4" /> Add new group
                        </Button>
                        <Button size="sm" onClick={onOpen}>
                            <Plus className="mr-2 size-4" /> Create person
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc ml-5">
                        {groups.map((group) => (
                            <li key={group.group_id} className="text-gray-700">
                                {group.name}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <NewUserSheet />
            <NewGroupSheet />
        </div>
    )
}

export default SplitPage