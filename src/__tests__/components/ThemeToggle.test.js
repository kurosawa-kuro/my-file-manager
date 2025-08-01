import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useTheme } from 'next-themes'
import ThemeToggle from '../../components/ThemeToggle'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })
  })

  it('should render theme toggle button', () => {
    // Act
    render(<ThemeToggle />)

    // Assert
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('🌙')).toBeInTheDocument() // Dark mode icon when theme is light
  })

  it('should toggle to dark theme when clicked', () => {
    // Arrange
    render(<ThemeToggle />)

    // Act
    fireEvent.click(screen.getByRole('button'))

    // Assert
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should show light icon when theme is dark', () => {
    // Arrange
    useTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })

    // Act
    render(<ThemeToggle />)

    // Assert
    expect(screen.getByText('☀️')).toBeInTheDocument() // Light mode icon when theme is dark
  })

  it('should toggle to light theme when clicked in dark mode', () => {
    // Arrange
    useTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })
    render(<ThemeToggle />)

    // Act
    fireEvent.click(screen.getByRole('button'))

    // Assert
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})