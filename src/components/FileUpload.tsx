import { useRef, useState } from 'react'

interface AcceptConfig {
  mime: string
  label: string
}

interface Props {
  type: 'image' | 'video'
  file: File | null
  onChange: (file: File | null) => void
}

const ACCEPT: Record<'image' | 'video', AcceptConfig> = {
  image: { mime: 'image/jpeg,image/png', label: 'JPEG or PNG' },
  video: { mime: 'video/mp4', label: 'MP4' },
}

export default function FileUpload({ type, file, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const config = ACCEPT[type]

  const validate = (f: File): boolean => {
    if (type === 'image') return ['image/jpeg', 'image/png'].includes(f.type)
    return f.type === 'video/mp4'
  }

  const handleFile = (f: File | undefined) => {
    if (f && validate(f)) onChange(f)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
  }

  const handleClear = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {type === 'image' ? 'Image' : 'Video'} ({config.label})
      </label>

      {file ? (
        <div className="flex items-center justify-between border border-gray-700 rounded-md px-4 py-3 bg-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <FileIcon type={type} />
            <span className="text-sm text-gray-200 truncate">{file.name}</span>
            <span className="text-xs text-gray-500 shrink-0">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Remove file"
            className="ml-3 text-gray-500 hover:text-red-400 text-xl leading-none shrink-0 focus:outline-none"
          >
            &times;
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md px-4 py-10 cursor-pointer transition-colors ${
            dragging
              ? 'border-blue-500 bg-blue-950'
              : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800'
          }`}
        >
          <UploadIcon />
          <p className="mt-2 text-sm text-gray-400">
            Drag & drop or{' '}
            <span className="text-blue-400 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">{config.label} only</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={config.mime}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}

function FileIcon({ type }: { type: 'image' | 'video' }) {
  return (
    <svg className="w-8 h-8 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {type === 'image' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      )}
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}
