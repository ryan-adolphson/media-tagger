import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from './FileUpload'

const setup = (type: 'image' | 'video', file: File | null = null) => {
  const onChange = vi.fn()
  const { container } = render(<FileUpload type={type} file={file} onChange={onChange} />)
  const fileInput = () => container.querySelector('input[type="file"]') as HTMLInputElement
  return { onChange, fileInput }
}

const jpeg = () => new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
const png  = () => new File(['data'], 'photo.png', { type: 'image/png' })
const mp4  = () => new File(['data'], 'clip.mp4',  { type: 'video/mp4' })
const gif  = () => new File(['data'], 'anim.gif',  { type: 'image/gif' })
const avi  = () => new File(['data'], 'clip.avi',  { type: 'video/avi' })

describe('FileUpload', () => {
  describe('upload zone (no file selected)', () => {
    it('shows drop zone when no file is provided', () => {
      setup('image')
      expect(screen.getByText(/drag & drop/i)).toBeInTheDocument()
    })

    it('shows "JPEG or PNG only" hint for image type', () => {
      setup('image')
      expect(screen.getByText('JPEG or PNG only')).toBeInTheDocument()
    })

    it('shows "MP4 only" hint for video type', () => {
      setup('video')
      expect(screen.getByText('MP4 only')).toBeInTheDocument()
    })
  })

  describe('file validation', () => {
    it('accepts jpeg files for image type', async () => {
      const { onChange, fileInput } = setup('image')
      await userEvent.upload(fileInput(), jpeg())
      expect(onChange).toHaveBeenCalledWith(expect.any(File))
    })

    it('accepts png files for image type', async () => {
      const { onChange, fileInput } = setup('image')
      await userEvent.upload(fileInput(), png())
      expect(onChange).toHaveBeenCalledWith(expect.any(File))
    })

    it('rejects non-image files for image type', async () => {
      const { onChange, fileInput } = setup('image')
      await userEvent.upload(fileInput(), gif())
      expect(onChange).not.toHaveBeenCalled()
    })

    it('accepts mp4 files for video type', async () => {
      const { onChange, fileInput } = setup('video')
      await userEvent.upload(fileInput(), mp4())
      expect(onChange).toHaveBeenCalledWith(expect.any(File))
    })

    it('rejects non-mp4 files for video type', async () => {
      const { onChange, fileInput } = setup('video')
      await userEvent.upload(fileInput(), avi())
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('selected file display', () => {
    it('shows the file name when a file is provided', () => {
      setup('image', jpeg())
      expect(screen.getByText('photo.jpg')).toBeInTheDocument()
    })

    it('shows the file size when a file is provided', () => {
      setup('image', jpeg())
      expect(screen.getByText(/0\.00 MB/i)).toBeInTheDocument()
    })

    it('calls onChange with null when the clear button is clicked', async () => {
      const { onChange } = setup('image', jpeg())
      await userEvent.click(screen.getByLabelText('Remove file'))
      expect(onChange).toHaveBeenCalledWith(null)
    })
  })
})
