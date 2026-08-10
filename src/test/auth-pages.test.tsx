import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import ForgotPassword from '../app/auth/forgot-password/page'
import ResetPassword from '../app/auth/reset-password/page'
import Request from '../lib/request'

describe('forgot password', () => {
  it('confirms without revealing whether the account exists', async () => {
    const post = vi.spyOn(Request, 'Post').mockResolvedValue({ message: 'ok' })
    render(<MemoryRouter><ForgotPassword onBack={() => {}} /></MemoryRouter>)

    await userEvent.type(screen.getByPlaceholderText('Email'), 'someone@example.com')
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }))

    await waitFor(() => expect(screen.getByText(/o link chegará/i)).toBeInTheDocument())
    expect(post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'someone@example.com' })
  })
})

describe('reset password', () => {
  it('refuses to submit without a token in the link', () => {
    render(<MemoryRouter initialEntries={['/reset-password']}><ResetPassword onDone={() => {}} onBack={() => {}} /></MemoryRouter>)
    expect(screen.getByText(/link inválido/i)).toBeInTheDocument()
  })

  it('rejects mismatched passwords before calling the API', async () => {
    const post = vi.spyOn(Request, 'Post').mockResolvedValue({ access_token: 't' })
    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPassword onDone={() => {}} onBack={() => {}} />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText('Nova senha'), 'Password1')
    await userEvent.type(screen.getByPlaceholderText('Confirmar senha'), 'Password2')
    await userEvent.click(screen.getByRole('button', { name: /redefinir senha/i }))

    expect(screen.getByText(/não conferem/i)).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('submits the new password with the token from the URL', async () => {
    const post = vi.spyOn(Request, 'Post').mockResolvedValue({ access_token: 'new-token' })
    const onDone = vi.fn()
    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPassword onDone={onDone} onBack={() => {}} />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText('Nova senha'), 'Password1')
    await userEvent.type(screen.getByPlaceholderText('Confirmar senha'), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: /redefinir senha/i }))

    await waitFor(() => expect(onDone).toHaveBeenCalledWith('new-token'))
    expect(post).toHaveBeenCalledWith('/auth/reset-password', { token: 'abc', new_password: 'Password1' })
  })
})
