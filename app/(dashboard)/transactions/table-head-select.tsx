import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type TableHeadSelectProps = {
    columnIndex: number,
    selectedColumns: Record<string, string | null>
    onChange: (
        columnIndex: number,
        value: string | null // null since we can skip fields
    ) => void
}

const options = ["amount", "payee", "notes", "date"] // from import-cards, can have other fields from that

export const TableHeadSelect = ({ columnIndex, selectedColumns, onChange }: TableHeadSelectProps) => {
    return <div>Select</div>
}
