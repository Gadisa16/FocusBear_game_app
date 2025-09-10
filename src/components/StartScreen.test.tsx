import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'
import { store } from '@/store'
import StartScreen from '@/components/StartScreen'

describe('StartScreen', () => {
  it('renders and has a button', () => {
    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>
    )
    expect(screen.getByRole('button', { name: /generate tasks/i })).toBeInTheDocument()
  })
})
