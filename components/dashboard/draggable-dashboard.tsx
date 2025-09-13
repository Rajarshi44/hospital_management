"use client"

import React, { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Settings, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DashboardWidget {
  id: string
  title: string
  type: "metric" | "chart" | "table" | "list" | "custom"
  size: "sm" | "md" | "lg" | "xl"
  priority: number
  data?: any
  component?: React.ComponentType<any>
  isVisible?: boolean
}

interface DraggableDashboardProps {
  widgets: DashboardWidget[]
  onWidgetOrderChange?: (widgets: DashboardWidget[]) => void
  onWidgetToggle?: (widgetId: string, isVisible: boolean) => void
  className?: string
}

interface SortableWidgetProps {
  widget: DashboardWidget
  children: React.ReactNode
  isDragDisabled?: boolean
}

function SortableWidget({ widget, children, isDragDisabled = false }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: widget.id,
    disabled: isDragDisabled || !widget.isVisible,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!widget.isVisible) {
    return null
  }

  const sizeClasses = {
    sm: "col-span-1 row-span-1",
    md: "col-span-2 row-span-1", 
    lg: "col-span-2 row-span-2",
    xl: "col-span-4 row-span-2",
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative transition-all duration-200",
        sizeClasses[widget.size],
        isDragging && "opacity-50 z-50"
      )}
      {...(transform && {
        style: {
          transform: CSS.Transform.toString(transform),
          transition,
        }
      })}
    >
      <Card className={cn(
        "h-full transition-all duration-200 hover:shadow-md",
        isDragging && "shadow-lg"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          <div className="flex items-center gap-2">
            {!isDragDisabled && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export function DraggableDashboard({ 
  widgets, 
  onWidgetOrderChange, 
  onWidgetToggle,
  className 
}: DraggableDashboardProps) {
  const [items, setItems] = useState<DashboardWidget[]>(widgets)
  const [isEditMode, setIsEditMode] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setItems(widgets)
  }, [widgets])

  // Load saved layout from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboard-layout")
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)
        setItems(parsed)
      } catch (error) {
        console.error("Error loading saved layout:", error)
      }
    }
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Save to localStorage
        localStorage.setItem("dashboard-layout", JSON.stringify(newItems))
        
        // Call callback if provided
        onWidgetOrderChange?.(newItems)
        
        return newItems
      })
    }
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    setItems(prev => {
      const updated = prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, isVisible: !widget.isVisible }
          : widget
      )
      
      // Save to localStorage
      localStorage.setItem("dashboard-layout", JSON.stringify(updated))
      
      // Call callback if provided
      const toggledWidget = updated.find(w => w.id === widgetId)
      if (toggledWidget) {
        onWidgetToggle?.(widgetId, toggledWidget.isVisible || false)
      }
      
      return updated
    })
  }

  const resetLayout = () => {
    const resetItems = widgets.map(widget => ({ ...widget, isVisible: true }))
    setItems(resetItems)
    localStorage.removeItem("dashboard-layout")
    onWidgetOrderChange?.(resetItems)
  }

  const visibleItems = items.filter(item => item.isVisible)
  const hiddenItems = items.filter(item => !item.isVisible)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <Badge variant="outline" className="text-xs">
            {visibleItems.length} widgets
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? "Done" : "Customize"}
          </Button>
          
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetLayout}
            >
              Reset Layout
            </Button>
          )}
        </div>
      </div>

      {/* Edit Mode: Hidden Widgets */}
      {isEditMode && hiddenItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hidden Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hiddenItems.map(widget => (
                <Button
                  key={widget.id}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {widget.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleItems.map(item => item.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-4 gap-4 auto-rows-[200px]">
            {visibleItems.map((widget) => (
              <SortableWidget 
                key={widget.id} 
                widget={widget}
                isDragDisabled={!isEditMode}
              >
                <div className="h-full flex flex-col">
                  {isEditMode && (
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Render widget content */}
                  {widget.component ? (
                    <widget.component data={widget.data} />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      Widget content for {widget.title}
                    </div>
                  )}
                </div>
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Instructions for edit mode */}
      {isEditMode && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Customize your dashboard:</p>
              <ul className="text-xs space-y-1">
                <li>• Drag widgets by the grip handle to reorder them</li>
                <li>• Click the X button to hide widgets</li>
                <li>• Add hidden widgets back using the + buttons above</li>
                <li>• Your layout will be automatically saved</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}