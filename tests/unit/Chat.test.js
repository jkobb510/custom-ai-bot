import React from 'react'
import { render, screen } from '@testing-library/react'
import Chat from '@/app/Chat'

describe('Chat Component - Unit Tests', () => {
  it('should render without crashing', () => {
    render(<Chat />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should display a message input field', () => {
    render(<Chat />)
    const input = screen.queryByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should have a submit button', () => {
    render(<Chat />)
    const button = screen.queryByRole('button', { name: /send|submit/i })
    expect(button).toBeInTheDocument()
  })

  it('should render the messages container', () => {
    render(<Chat />)
    expect(screen.queryByTestId('messages-container')).toBeInTheDocument()
  })
})
