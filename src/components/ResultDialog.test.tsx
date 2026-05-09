import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultDialog from './ResultDialog'
import { SearchResponse } from '../types'

const mockResult: SearchResponse = {
  found: ['ryan', 'andy'],
  keyword_count: 3,
  match_count: 2,
  not_found: ['stephanie'],
}

describe('ResultDialog', () => {
  describe('success state', () => {
    it('shows the keyword count stat card', () => {
      render(<ResultDialog result={mockResult} onClose={vi.fn()} />)
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText(/keywords/i)).toBeInTheDocument()
    })

    it('shows the match count stat card', () => {
      render(<ResultDialog result={mockResult} onClose={vi.fn()} />)
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText(/matches/i)).toBeInTheDocument()
    })

    it('renders each found keyword as a chip', () => {
      render(<ResultDialog result={mockResult} onClose={vi.fn()} />)
      expect(screen.getByText('ryan')).toBeInTheDocument()
      expect(screen.getByText('andy')).toBeInTheDocument()
    })

    it('renders each not-found keyword as a chip', () => {
      render(<ResultDialog result={mockResult} onClose={vi.fn()} />)
      expect(screen.getByText('stephanie')).toBeInTheDocument()
    })

    it('shows empty state message when found list is empty', () => {
      render(<ResultDialog result={{ ...mockResult, found: [] }} onClose={vi.fn()} />)
      expect(screen.getByText(/no keywords found/i)).toBeInTheDocument()
    })

    it('shows empty state message when not_found list is empty', () => {
      render(<ResultDialog result={{ ...mockResult, not_found: [] }} onClose={vi.fn()} />)
      expect(screen.getByText(/all keywords were found/i)).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('displays the error message', () => {
      render(<ResultDialog error="Server error 500" onClose={vi.fn()} />)
      expect(screen.getByText('Server error 500')).toBeInTheDocument()
    })

    it('shows "Request Failed" as the dialog title', () => {
      render(<ResultDialog error="oops" onClose={vi.fn()} />)
      expect(screen.getByText('Request Failed')).toBeInTheDocument()
    })
  })

  describe('closing', () => {
    it('calls onClose when the × button is clicked', async () => {
      const onClose = vi.fn()
      render(<ResultDialog result={mockResult} onClose={onClose} />)
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when the Close button is clicked', async () => {
      const onClose = vi.fn()
      render(<ResultDialog result={mockResult} onClose={onClose} />)
      await userEvent.click(screen.getByRole('button', { name: 'Close' }))
      expect(onClose).toHaveBeenCalledOnce()
    })
  })
})
