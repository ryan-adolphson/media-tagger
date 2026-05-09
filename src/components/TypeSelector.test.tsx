import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TypeSelector from './TypeSelector'
import { ContentType } from '../types'

const setup = (value: ContentType = 'text') => {
  const onChange = vi.fn()
  render(<TypeSelector value={value} onChange={onChange} />)
  return { onChange }
}

describe('TypeSelector', () => {
  it('renders all three type tabs', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Text' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Image' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Video' })).toBeInTheDocument()
  })

  it('calls onChange with "text" when Text tab is clicked', async () => {
    const { onChange } = setup('image')
    await userEvent.click(screen.getByRole('button', { name: 'Text' }))
    expect(onChange).toHaveBeenCalledWith('text')
  })

  it('calls onChange with "image" when Image tab is clicked', async () => {
    const { onChange } = setup('text')
    await userEvent.click(screen.getByRole('button', { name: 'Image' }))
    expect(onChange).toHaveBeenCalledWith('image')
  })

  it('calls onChange with "video" when Video tab is clicked', async () => {
    const { onChange } = setup('text')
    await userEvent.click(screen.getByRole('button', { name: 'Video' }))
    expect(onChange).toHaveBeenCalledWith('video')
  })

  it('applies active styles to the selected tab', () => {
    setup('image')
    const imageBtn = screen.getByRole('button', { name: 'Image' })
    const textBtn = screen.getByRole('button', { name: 'Text' })
    expect(imageBtn.className).toContain('bg-gray-600')
    expect(textBtn.className).not.toContain('bg-gray-600')
  })
})
