import { useState } from 'react'

interface Props {
  keywords: string[]
  onChange: (keywords: string[]) => void
}

export default function KeywordInput({ keywords, onChange }: Props) {
  const [input, setInput] = useState('')

  const addKeyword = () => {
    const normalized = input.trim().toLowerCase()
    if (normalized && !keywords.includes(normalized)) {
      onChange([...keywords, normalized])
    }
    setInput('')
  }

  const removeKeyword = (word: string) => {
    onChange(keywords.filter((k) => k !== word))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Keywords
      </label>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a keyword and press Enter or Add"
          className="flex-1 border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addKeyword}
          disabled={!input.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((word) => (
            <span
              key={word}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900 text-blue-200 text-sm rounded-full"
            >
              {word}
              <button
                type="button"
                onClick={() => removeKeyword(word)}
                aria-label={`Remove ${word}`}
                className="ml-1 text-blue-400 hover:text-blue-100 leading-none focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
