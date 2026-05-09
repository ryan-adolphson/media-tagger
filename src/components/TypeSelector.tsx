import { ContentType } from '../types'

interface TypeOption {
  value: ContentType
  label: string
}

interface Props {
  value: ContentType
  onChange: (type: ContentType) => void
}

const TYPES: TypeOption[] = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
]

export default function TypeSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-gray-700 bg-gray-800 p-1 gap-1">
      {TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none ${
            value === t.value
              ? 'bg-gray-600 text-gray-100 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
