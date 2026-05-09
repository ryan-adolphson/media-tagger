import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KeywordInput from './KeywordInput'

const setup = (keywords: string[] = []) => {
  const onChange = vi.fn()
  render(<KeywordInput keywords={keywords} onChange={onChange} />)
  return {
    onChange,
    input: screen.getByRole('textbox'),
    addBtn: screen.getByRole('button', { name: /add/i }),
  }
}

describe('KeywordInput', () => {
  describe('adding keywords', () => {
    it('adds a keyword when Enter is pressed', async () => {
      const { onChange, input } = setup()
      await userEvent.type(input, 'hello{Enter}')
      expect(onChange).toHaveBeenCalledWith(['hello'])
    })

    it('adds a keyword when the Add button is clicked', async () => {
      const { onChange, input, addBtn } = setup()
      await userEvent.type(input, 'world')
      await userEvent.click(addBtn)
      expect(onChange).toHaveBeenCalledWith(['world'])
    })

    it('trims surrounding whitespace from the keyword', async () => {
      const { onChange, input } = setup()
      await userEvent.type(input, '  hello  {Enter}')
      expect(onChange).toHaveBeenCalledWith(['hello'])
    })

    it('lowercases the keyword', async () => {
      const { onChange, input } = setup()
      await userEvent.type(input, 'HELLO{Enter}')
      expect(onChange).toHaveBeenCalledWith(['hello'])
    })

    it('appends to existing keywords', async () => {
      const { onChange, input } = setup(['cat'])
      await userEvent.type(input, 'dog{Enter}')
      expect(onChange).toHaveBeenCalledWith(['cat', 'dog'])
    })
  })

  describe('validation', () => {
    it('ignores duplicate keywords', async () => {
      const { onChange, input } = setup(['hello'])
      await userEvent.type(input, 'hello{Enter}')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('ignores whitespace-only input', async () => {
      const { onChange, input } = setup()
      await userEvent.type(input, '   {Enter}')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('disables the Add button when the input is empty', () => {
      const { addBtn } = setup()
      expect(addBtn).toBeDisabled()
    })

    it('enables the Add button when the input has a value', async () => {
      const { input, addBtn } = setup()
      await userEvent.type(input, 'a')
      expect(addBtn).not.toBeDisabled()
    })
  })

  describe('removing keywords', () => {
    it('calls onChange without the removed keyword', async () => {
      const onChange = vi.fn()
      render(<KeywordInput keywords={['cat', 'dog']} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText('Remove cat'))
      expect(onChange).toHaveBeenCalledWith(['dog'])
    })

    it('renders a remove button for each keyword', () => {
      render(<KeywordInput keywords={['cat', 'dog', 'fox']} onChange={vi.fn()} />)
      expect(screen.getByLabelText('Remove cat')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove dog')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove fox')).toBeInTheDocument()
    })
  })

  it('clears the input after a keyword is added', async () => {
    const { input } = setup()
    await userEvent.type(input, 'hello{Enter}')
    expect(input).toHaveValue('')
  })
})
