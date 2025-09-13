"use client"

import { useState } from "react"
import { Search, Filter, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SearchFilter {
  id: string
  field: string
  operator: string
  value: string
  label: string
}

interface SearchField {
  id: string
  label: string
  type: "text" | "number" | "date" | "select"
  options?: { value: string; label: string }[]
}

interface AdvancedSearchProps {
  fields: SearchField[]
  onSearch: (query: string, filters: SearchFilter[]) => void
  placeholder?: string
}

export function AdvancedSearch({ fields, onSearch, placeholder = "Search..." }: AdvancedSearchProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [newFilter, setNewFilter] = useState({
    field: "",
    operator: "",
    value: "",
  })

  const operators = {
    text: [
      { value: "contains", label: "Contains" },
      { value: "equals", label: "Equals" },
      { value: "starts_with", label: "Starts with" },
      { value: "ends_with", label: "Ends with" },
    ],
    number: [
      { value: "equals", label: "Equals" },
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "between", label: "Between" },
    ],
    date: [
      { value: "equals", label: "On" },
      { value: "after", label: "After" },
      { value: "before", label: "Before" },
      { value: "between", label: "Between" },
    ],
    select: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
    ],
  }

  const addFilter = () => {
    if (!newFilter.field || !newFilter.operator || !newFilter.value) return

    const field = fields.find((f) => f.id === newFilter.field)
    if (!field) return

    const filter: SearchFilter = {
      id: Math.random().toString(36).substr(2, 9),
      field: newFilter.field,
      operator: newFilter.operator,
      value: newFilter.value,
      label: `${field.label} ${operators[field.type].find((op) => op.value === newFilter.operator)?.label} ${newFilter.value}`,
    }

    const updatedFilters = [...filters, filter]
    setFilters(updatedFilters)
    setNewFilter({ field: "", operator: "", value: "" })
    onSearch(query, updatedFilters)
  }

  const removeFilter = (filterId: string) => {
    const updatedFilters = filters.filter((f) => f.id !== filterId)
    setFilters(updatedFilters)
    onSearch(query, updatedFilters)
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    onSearch(searchQuery, filters)
  }

  const clearAll = () => {
    setQuery("")
    setFilters([])
    onSearch("", [])
  }

  const selectedField = fields.find((f) => f.id === newFilter.field)
  const availableOperators = selectedField ? operators[selectedField.type] : []

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {(query || filters.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="gap-1">
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filter.id)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Add Search Filter</h4>

            {/* Field Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Field</label>
              <Select
                value={newFilter.field}
                onValueChange={(value) => setNewFilter((prev) => ({ ...prev, field: value, operator: "", value: "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator Selection */}
            {newFilter.field && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select
                  value={newFilter.operator}
                  onValueChange={(value) => setNewFilter((prev) => ({ ...prev, operator: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOperators.map((operator) => (
                      <SelectItem key={operator.value} value={operator.value}>
                        {operator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Value Input */}
            {newFilter.operator && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Value</label>
                {selectedField?.type === "select" ? (
                  <Select
                    value={newFilter.value}
                    onValueChange={(value) => setNewFilter((prev) => ({ ...prev, value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedField.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={
                      selectedField?.type === "number" ? "number" : selectedField?.type === "date" ? "date" : "text"
                    }
                    value={newFilter.value}
                    onChange={(e) => setNewFilter((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter value"
                  />
                )}
              </div>
            )}

            <Button
              onClick={addFilter}
              className="w-full"
              disabled={!newFilter.field || !newFilter.operator || !newFilter.value}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
