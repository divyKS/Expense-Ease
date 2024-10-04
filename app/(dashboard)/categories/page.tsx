'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react"
import { columns } from "./columns"
import { DataTable } from "@/components/DataTable"
import { Skeleton } from "@/components/ui/skeleton"
import { useNewCategory } from "@/features/categories/hooks/use-new-category"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories"


const CategoriesPage = () => {
    const newCategory = useNewCategory()
    const categoriesQuery = useGetCategories()
    const deleteCategories = useBulkDeleteCategories()
    const categories = categoriesQuery.data || []

    const isDisabled = categoriesQuery.isLoading || deleteCategories.isPending

    if(categoriesQuery.isLoading){
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
                    <CardTitle className="line-clamp-1 text-xl">Categories Page</CardTitle>
                    <Button size="sm" onClick={newCategory.onOpen}>
                        <Plus className="mr-2 size-4" /> Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={categories}
                        filterKey="categories"
                        disabled={isDisabled}
                        onDelete={(row) => {
                            const ids = row.map((r) => r.original.id)
                            deleteCategories.mutate({ids})
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default CategoriesPage