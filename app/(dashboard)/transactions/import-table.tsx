import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'
import { TableHeadSelect } from './table-head-select'

// import { TableHeadSelect } from './table-head-select'

type ImportTableProps = {
	headers: string[],
	body: string[][],
	selectedColumns: Record<string, string | null>,
    // so that we can select if the heading is for payee or something else
	onTableHeadSelectChange: (columnIndex: number, value: string | null) => void
}

export const ImportTable = ({ headers, body, onTableHeadSelectChange, selectedColumns }: ImportTableProps) => {
	return (
		<div className="overflow-hidden rounded-md border">
			<Table>
				<TableHeader className="bg-muted">
					<TableRow>
						{headers.map((_header, index) => (
							<TableHead key={index}>
                                {/* {index} */}
								<TableHeadSelect
									columnIndex={index}
									selectedColumns={selectedColumns}
									onChange={onTableHeadSelectChange}
								/>
							</TableHead>
						))}
					</TableRow>
				</TableHeader>

				<TableBody>
					{body.map((row: string[], index) => (
						<TableRow key={index}>
							{row.map((cell, index) => (
								<TableCell key={index}>
                                    {cell}
                                </TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
