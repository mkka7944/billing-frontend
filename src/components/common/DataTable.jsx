import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function DataTable({
    columns,
    data,
    loading,
    onRowClick,
}) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="rounded-md border border-border/50 bg-card/30">
            <Table>
                <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={`text-[10px] font-black uppercase tracking-widest text-muted-foreground h-10 px-4 ${header.column.columnDef.meta?.className || ''}`}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground animate-pulse">
                                    <span className="text-xs font-bold uppercase tracking-widest">Hydrating Dataset...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${onRowClick ? 'cursor-pointer active:scale-[0.99] active:bg-muted/50' : ''}`}
                                onClick={() => onRowClick && onRowClick(row.original)}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={`px-4 py-3 ${cell.column.columnDef.meta?.className || ''}`}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                No results found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
