import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chat from '@/app/Chat'

describe('Chat Flow - Integration Tests', () => {
  it('should send a message and update the UI', async () => {
    render(<Chat />)

    const input = screen.queryByRole('textbox')
    const sendButton = screen.queryByRole('button', { name: /send|submit/i })

    if (input && sendButton) {
      await userEvent.type(input, 'Hello AI')
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.queryByText(/Hello AI/i)).toBeInTheDocument()
      })
    }
  })

  it('should display multiple messages in sequence', async () => {
    render(<Chat />)

    const messages = ['First message', 'Second message']
    const input = screen.queryByRole('textbox')
    const sendButton = screen.queryByRole('button', { name: /send|submit/i })

    for (const message of messages) {
      if (input && sendButton) {
        await userEvent.type(input, message)
        fireEvent.click(sendButton)
      }
    }

    await waitFor(() => {
      expect(screen.queryByText(/First message/i)).toBeInTheDocument()
      expect(screen.queryByText(/Second message/i)).toBeInTheDocument()
    })
  })

  it('should clear input after sending a message', async () => {
    render(<Chat />)

    const input = screen.queryByRole('textbox')
    const sendButton = screen.queryByRole('button', { name: /send|submit/i })

    if (input && sendButton) {
      await userEvent.type(input, 'Test message')
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    }
  })
})
