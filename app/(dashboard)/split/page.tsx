import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

const SplitPage = () => {
    return (
        <div className="mx-auto max-w-screen-2xl w-full  -mt-6 pb-10">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="line-clamp-1 text-xl">Split Page</CardTitle>
                    <div className="flex gap-x-2">
                        <Button size="sm">
                            <Plus className="mr-2 size-4" /> Add new group
                        </Button>
                        <Button size="sm">
                            <Plus className="mr-2 size-4" /> Create person
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* <DataTable
                        columns={}
                        data={}
                        filterKey="name"
                        disabled={}
                        onDelete={}
                    /> */}
                </CardContent>
            </Card>
        </div>
    )
}

export default SplitPage