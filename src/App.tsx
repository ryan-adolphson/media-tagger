import { useState } from 'react'
import KeywordInput from './components/KeywordInput'
import ResultDialog from './components/ResultDialog'
import TypeSelector from './components/TypeSelector'
import FileUpload from './components/FileUpload'
import HttpService from './services/http-service'
import { ContentType, SearchResponse } from './types'

const MAX_TEXT_LENGTH = 10000
const http = new HttpService('', { 'X-API-Key': 'my-secret-key' })

interface DialogState {
  result?: SearchResponse
  error?: string
}

function sanitizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export default function App() {
  const [type, setType] = useState<ContentType>('text')
  const [text, setText] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const isOverLimit = text.length > MAX_TEXT_LENGTH

  const canSubmit = !loading && (() => {
    if (type === 'text') return text.trim().length > 0 && keywords.length > 0 && !isOverLimit
    return file !== null
  })()

  const handleTypeChange = (newType: ContentType) => {
    setType(newType)
    setFile(null)
    setText('')
    setKeywords([])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    try {
      let result: SearchResponse

      if (type === 'text') {
        result = await http.post<SearchResponse>('/search', {
          text: sanitizeText(text),
          keywords,
        })
      } else if (type === 'image') {
        result = await http.postImage<SearchResponse>(file!)
      } else {
        result = await http.postVideo<SearchResponse>(file!)
      }

      setDialog({ result })
    } catch (err) {
      setDialog({ error: err instanceof Error ? err.message : 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-1">Keyword Search</h1>
        <p className="text-sm text-gray-400 mb-6">
          Enter your content and keywords, then submit to search.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <TypeSelector value={type} onChange={handleTypeChange} />

          {type === 'text' && (
            <>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">Text</label>
                  <span className={`text-xs ${isOverLimit ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                    {text.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
                  </span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder="Paste or type your text here..."
                  className={`w-full border rounded-md px-3 py-2 text-sm text-gray-100 bg-gray-800 placeholder-gray-500 resize-y focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    isOverLimit
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {isOverLimit && (
                  <p className="mt-1 text-xs text-red-400">
                    Text exceeds {MAX_TEXT_LENGTH.toLocaleString()} character limit by{' '}
                    {(text.length - MAX_TEXT_LENGTH).toLocaleString()} characters.
                  </p>
                )}
              </div>

              <KeywordInput keywords={keywords} onChange={setKeywords} />
            </>
          )}

          {(type === 'image' || type === 'video') && (
            <FileUpload type={type} file={file} onChange={setFile} />
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>

      {dialog && (
        <ResultDialog
          result={dialog.result}
          error={dialog.error}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}
