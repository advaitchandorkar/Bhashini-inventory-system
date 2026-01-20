"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { api } from "@/lib/api"
export const columns = [
 
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "unit",
    header: () => <div className="text-left">Unit</div>,
  },
  {
    accessorKey: "price_per_unit",
    header: () => <div className="text-right">Price / Unit</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price_per_unit") || 0);
      const currency = row.original?.currency || "INR";
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                const newQty = window.prompt("Set new quantity", item.quantity);
                if (newQty === null) return;
                await api.patch(`/api/inventory/${item._id}`, {
                  quantity: Number(newQty),
                });
                window.location.reload();
              }}
            >
              Adjust quantity
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                const ok = window.confirm("Delete this item?");
                if (!ok) return;
                await api.delete(`/api/inventory/${item._id}`);
                window.location.reload();
              }}
            >
              Delete item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
