"use client"

import type React from "react"

import { useState } from "react"
import { Trash2, Download, Archive, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"

interface BulkActionsProps {
  selectedItems: string[]
  totalItems: number
  onSelectAll: (selected: boolean) => void
  onBulkAction: (action: string, items: string[]) => Promise<void>
  actions?: {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    variant?: "default" | "destructive"
    requiresConfirmation?: boolean
  }[]
}

const defaultActions = [
  {
    id: "export",
    label: "Export Selected",
    icon: Download,
    variant: "default" as const,
  },
  {
    id: "archive",
    label: "Archive Selected",
    icon: Archive,
    variant: "default" as const,
  },
  {
    id: "delete",
    label: "Delete Selected",
    icon: Trash2,
    variant: "destructive" as const,
    requiresConfirmation: true,
  },
]

export function BulkActions({
  selectedItems,
  totalItems,
  onSelectAll,
  onBulkAction,
  actions = defaultActions,
}: BulkActionsProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const isAllSelected = selectedItems.length === totalItems && totalItems > 0
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < totalItems

  const handleSelectAll = () => {
    onSelectAll(!isAllSelected)
  }

  const handleAction = async (actionId: string) => {
    const action = actions.find((a) => a.id === actionId)

    if (action?.requiresConfirmation) {
      setPendingAction(actionId)
      setIsConfirmOpen(true)
      return
    }

    await executeAction(actionId)
  }

  const executeAction = async (actionId: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      await onBulkAction(actionId, selectedItems)
      toast({
        title: "Action completed",
        description: `Successfully processed ${selectedItems.length} items`,
      })
    } catch (error) {
      toast({
        title: "Action failed",
        description: "An error occurred while processing the selected items",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsConfirmOpen(false)
      setPendingAction(null)
    }
  }

  const confirmAction = () => {
    if (pendingAction) {
      executeAction(pendingAction)
    }
  }

  if (totalItems === 0) return null

  return (
    <>
      <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedItems.length > 0
              ? `${selectedItems.length} of ${totalItems} selected`
              : `Select all ${totalItems} items`}
          </span>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            {actions.slice(0, 2).map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant={action.variant === "destructive" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleAction(action.id)}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              )
            })}

            {actions.length > 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isProcessing}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.slice(2).map((action, index) => {
                    const Icon = action.icon
                    return (
                      <div key={action.id}>
                        {index === 0 && actions.length > 2 && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={() => handleAction(action.id)}
                          className={action.variant === "destructive" ? "text-destructive" : ""}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </DropdownMenuItem>
                      </div>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to perform this action on {selectedItems.length} selected items? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
