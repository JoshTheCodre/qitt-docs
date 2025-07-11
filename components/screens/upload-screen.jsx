"use client"

import { useState } from "react"
import { Upload, FileText, ImageIcon, File, Camera, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import TopNav from "@/components/top-nav"
import { useToast } from "@/hooks/use-toast"

const departments = [
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business Administration",
  "Economics",
  "Psychology",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "English",
]

export default function UploadScreen({ user, onNavigate }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [department, setDepartment] = useState("")
  const [level, setLevel] = useState("")
  const [price, setPrice] = useState("")
  const [tags, setTags] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const simulateUploadProgress = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title || !department || !level) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    simulateUploadProgress()

    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `resources/${fileName}`

      const { error: uploadError } = await supabase.storage.from("resources").upload(filePath, file)

      if (uploadError) throw uploadError

      // Save resource metadata to database
      const { error: dbError } = await supabase.from("resources").insert({
        title,
        description,
        uploader_id: user.id,
        department,
        level,
        price: Number.parseFloat(price) || 0,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        storage_path: filePath,
        file_type: file.type,
      })

      if (dbError) throw dbError

      setUploadComplete(true)

      toast({
        title: "🎉 Upload Successful!",
        description: "Your resource has been uploaded and is now available.",
      })

      // Reset form after delay
      setTimeout(() => {
        setFile(null)
        setTitle("")
        setDescription("")
        setDepartment("")
        setLevel("")
        setPrice("")
        setTags("")
        setUploadComplete(false)
        setUploadProgress(0)
      }, 2000)
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = () => {
    if (!file) return <Upload className="w-12 h-12 text-gray-400" />

    if (file.type.includes("image")) return <ImageIcon className="w-12 h-12 text-blue-500" />
    if (file.type.includes("pdf")) return <FileText className="w-12 h-12 text-red-500" />
    return <File className="w-12 h-12 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav title="Upload Resource" showBack onBack={() => onNavigate("home")} />

      <div className="p-6">
        <Card className="rounded-2xl card-shadow bg-white">
          <CardContent className="p-6">
            {uploadComplete ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Complete!</h3>
                <p className="text-gray-600 mb-4">Your resource is now live and available for purchase</p>
                <Button onClick={() => onNavigate("library")} className="bg-blue-500 hover:bg-blue-600 text-white">
                  View in Library
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-6">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-3">
                      {getFileIcon()}
                      <div>
                        <p className="text-gray-900 font-medium">{file ? file.name : "Choose a file to upload"}</p>
                        {file && <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>}
                        <p className="text-gray-500 text-sm mt-1">PDF, DOC, PPT, or Images up to 10MB</p>
                      </div>
                      {!file && (
                        <Button type="button" className="bg-blue-500 hover:bg-blue-600 text-white">
                          <Camera className="w-4 h-4 mr-2" />
                          Select File
                        </Button>
                      )}
                    </div>
                  </label>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Title *</label>
                    <Input
                      placeholder="e.g.,Calclus, Thermodynamics, Trade "
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="rounded-xl border-gray-200 h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <Textarea
                      placeholder="Describe what this resource contains and how it can help students..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-gray-200"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                      <Select value={department} onValueChange={setDepartment} required>
                        <SelectTrigger className="rounded-xl border-gray-200 h-12">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Level *</label>
                      <Select value={level} onValueChange={setLevel} required>
                        <SelectTrigger className="rounded-xl border-gray-200 h-12">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 Level</SelectItem>
                          <SelectItem value="200">200 Level</SelectItem>
                          <SelectItem value="300">300 Level</SelectItem>
                          <SelectItem value="400">400 Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₦)</label>
                    <Input
                      type="number"
                      placeholder="0 for free, or set your price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="rounded-xl border-gray-200 h-12"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty or enter 0 to make it free</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                    <Input
                      placeholder="e.g., MTH 120, Past-Question, Notes"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="rounded-xl border-gray-200 h-12"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-blue-500 hover:bg-blue-600"
                >
                  {uploading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Upload Resource</span>
                    </div>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
