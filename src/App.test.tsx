import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchResponse } from './types'

// vi.hoisted ensures mockHttp is initialised before vi.mock's factory runs
const mockHttp = vi.hoisted(() => ({
  post: vi.fn(),
  postImage: vi.fn(),
  postVideo: vi.fn(),
}))

vi.mock('./services/http-service', () => ({
  default: function MockHttpService() { return mockHttp },
}))

import App from './App'

const successResponse: SearchResponse = {
  found: ['ryan'],
  keyword_count: 2,
  match_count: 1,
  not_found: ['andy'],
}

const fillText = async (value: string) => {
  const textarea = screen.getByPlaceholderText(/paste or type/i)
  await userEvent.click(textarea)
  await userEvent.type(textarea, value)
}

const addKeyword = async (word: string) => {
  const input = screen.getByPlaceholderText(/type a keyword/i)
  await userEvent.type(input, `${word}{Enter}`)
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial render', () => {
    it('renders the page heading', () => {
      render(<App />)
      expect(screen.getByText('Keyword Search')).toBeInTheDocument()
    })

    it('renders the type selector tabs', () => {
      render(<App />)
      expect(screen.getByRole('button', { name: 'Text' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Image' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Video' })).toBeInTheDocument()
    })

    it('shows the textarea and keyword input on the Text tab by default', () => {
      render(<App />)
      expect(screen.getByPlaceholderText(/paste or type/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/type a keyword/i)).toBeInTheDocument()
    })

    it('has the submit button disabled initially', () => {
      render(<App />)
      expect(screen.getByRole('button', { name: /search/i })).toBeDisabled()
    })
  })

  describe('text tab', () => {
    it('enables submit when text and at least one keyword are provided', async () => {
      render(<App />)
      await fillText('some text here')
      await addKeyword('ryan')
      expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled()
    })

    it('keeps submit disabled when text is provided but no keywords', async () => {
      render(<App />)
      await fillText('some text')
      expect(screen.getByRole('button', { name: /search/i })).toBeDisabled()
    })

    it('keeps submit disabled when keywords are provided but no text', async () => {
      render(<App />)
      await addKeyword('ryan')
      expect(screen.getByRole('button', { name: /search/i })).toBeDisabled()
    })

    it('shows character count as text is typed', async () => {
      render(<App />)
      await fillText('hello')
      expect(screen.getByText(/5\s*\/\s*10,000/)).toBeInTheDocument()
    })

    it('shows over-limit error and disables submit when text exceeds 10,000 characters', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText(/paste or type/i)
      fireEvent.change(textarea, { target: { value: 'a'.repeat(10001) } })
      expect(screen.getByText(/exceeds/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /search/i })).toBeDisabled()
    })

    it('calls http.post with sanitized text and keywords on submit', async () => {
      mockHttp.post.mockResolvedValueOnce(successResponse)
      render(<App />)
      await fillText('  hello   world  ')
      await addKeyword('ryan')
      await userEvent.click(screen.getByRole('button', { name: /search/i }))
      await waitFor(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/search', {
          text: 'hello world',
          keywords: ['ryan'],
        })
      })
    })

    it('shows the result dialog after a successful submission', async () => {
      mockHttp.post.mockResolvedValueOnce(successResponse)
      render(<App />)
      await fillText('some text')
      await addKeyword('ryan')
      await userEvent.click(screen.getByRole('button', { name: /search/i }))
      await waitFor(() => {
        expect(screen.getByText('Search Results')).toBeInTheDocument()
      })
    })

    it('shows the error dialog when the API call fails', async () => {
      mockHttp.post.mockRejectedValueOnce(new Error('Server error 500'))
      render(<App />)
      await fillText('some text')
      await addKeyword('ryan')
      await userEvent.click(screen.getByRole('button', { name: /search/i }))
      await waitFor(() => {
        expect(screen.getByText('Request Failed')).toBeInTheDocument()
        expect(screen.getByText('Server error 500')).toBeInTheDocument()
      })
    })
  })

  describe('type switching', () => {
    it('shows file upload zone when Image tab is selected', async () => {
      render(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Image' }))
      expect(screen.getByText(/drag & drop/i)).toBeInTheDocument()
    })

    it('hides the keyword input when Image tab is selected', async () => {
      render(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Image' }))
      expect(screen.queryByPlaceholderText(/type a keyword/i)).not.toBeInTheDocument()
    })

    it('shows file upload zone when Video tab is selected', async () => {
      render(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Video' }))
      expect(screen.getByText(/drag & drop/i)).toBeInTheDocument()
    })

    it('resets text and keywords when switching away from the Text tab', async () => {
      render(<App />)
      await fillText('some text')
      await addKeyword('ryan')
      await userEvent.click(screen.getByRole('button', { name: 'Image' }))
      await userEvent.click(screen.getByRole('button', { name: 'Text' }))
      expect(screen.getByPlaceholderText(/paste or type/i)).toHaveValue('')
      expect(screen.queryByText('ryan')).not.toBeInTheDocument()
    })

    it('calls http.postImage when submitting on the Image tab', async () => {
      mockHttp.postImage.mockResolvedValueOnce(successResponse)
      render(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Image' }))
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(input, file)
      await userEvent.click(screen.getByRole('button', { name: /search/i }))
      await waitFor(() => {
        expect(mockHttp.postImage).toHaveBeenCalledWith(file)
      })
    })

    it('calls http.postVideo when submitting on the Video tab', async () => {
      mockHttp.postVideo.mockResolvedValueOnce(successResponse)
      render(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Video' }))
      const file = new File(['data'], 'clip.mp4', { type: 'video/mp4' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(input, file)
      await userEvent.click(screen.getByRole('button', { name: /search/i }))
      await waitFor(() => {
        expect(mockHttp.postVideo).toHaveBeenCalledWith(file)
      })
    })
  })
})
