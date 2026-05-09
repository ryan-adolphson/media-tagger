import { useEffect, useRef } from 'react'
import { SearchResponse } from '../types'

interface Props {
  result?: SearchResponse
  error?: string
  onClose: () => void
}

export default function ResultDialog({ result, error, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (el && !el.open) el.showModal()
  }, [])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="w-full max-w-lg rounded-xl shadow-2xl p-0 bg-gray-900 border border-gray-700 backdrop:bg-black/70 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">
          {error ? 'Request Failed' : 'Search Results'}
        </h2>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="text-gray-500 hover:text-gray-200 text-2xl leading-none focus:outline-none transition-colors"
        >
          &times;
        </button>
      </div>

      <div className="px-6 py-5">
        {error ? (
          <div className="rounded-lg bg-red-950 border border-red-800 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Keywords" value={result.keyword_count} />
              <StatCard label="Matches" value={result.match_count} />
            </div>

            <KeywordGroup
              title="Found"
              words={result.found}
              chipClass="bg-green-900 text-green-300"
              emptyText="No keywords found in text."
            />

            <KeywordGroup
              title="Not Found"
              words={result.not_found}
              chipClass="bg-red-900 text-red-300"
              emptyText="All keywords were found."
            />
          </div>
        ) : null}
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-500 transition-colors"
        >
          Close
        </button>
      </div>
    </dialog>
  )
}

interface StatCardProps {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg bg-gray-800 border border-gray-700 p-4 text-center">
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  )
}

interface KeywordGroupProps {
  title: string
  words: string[]
  chipClass: string
  emptyText: string
}

function KeywordGroup({ title, words, chipClass, emptyText }: KeywordGroupProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {title} ({words.length})
      </p>
      {words.length === 0 ? (
        <p className="text-sm text-gray-400 italic">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {words.map((w) => (
            <span key={w} className={`px-3 py-1 rounded-full text-sm font-medium ${chipClass}`}>
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
