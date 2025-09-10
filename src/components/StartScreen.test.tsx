import StartScreen from '@/components/StartScreen'
import { store } from '@/store'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'

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
