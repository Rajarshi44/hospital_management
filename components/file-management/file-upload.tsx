"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Upload, File, X, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress?: number
  status: "uploading" | "completed" | "error"
}

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFilesChange?: (files: FileItem[]) => void
  className?: string
}

export function FileUpload({
  accept = "*/*",
  multiple = true,
  maxSize = 10,
  onFilesChange,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`
    }
    return null
  }

  const simulateUpload = (fileItem: FileItem) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, uploadProgress: 100, status: "completed" as const } : f)),
        )
      } else {
        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, uploadProgress: progress } : f)))
      }
    }, 200)
  }

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: FileItem[] = []

      Array.from(fileList).forEach((file) => {
        const error = validateFile(file)
        if (error) {
          toast({
            title: "Upload Error",
            description: error,
            variant: "destructive",
          })
          return
        }

        const fileItem: FileItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadProgress: 0,
          status: "uploading",
        }

        newFiles.push(fileItem)
        simulateUpload(fileItem)
      })

      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    },
    [files, maxSize, onFilesChange],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles)
      }
    },
    [handleFiles],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles)
    }
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const previewFile = (file: FileItem) => {
    if (file.url) {
      window.open(file.url, "_blank")
    }
  }

  const downloadFile = (file: FileItem) => {
    if (file.url) {
      const link = document.createElement("a")
      link.href = file.url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          "hover:border-primary hover:bg-primary/5",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground">
              {accept === "*/*" ? "Any file type" : accept} • Max {maxSize}MB
            </p>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  {file.status === "uploading" && <Progress value={file.uploadProgress || 0} className="h-1 mt-1" />}
                </div>
                <div className="flex items-center gap-1">
                  {file.status === "completed" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => previewFile(file)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => downloadFile(file)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
