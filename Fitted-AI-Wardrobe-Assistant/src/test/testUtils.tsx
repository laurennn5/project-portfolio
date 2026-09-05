import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ClothingItem, UserProfile, WeatherData } from '../types'

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Custom render function (can add providers here later if needed)
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

// Mock data factories for consistent test data
export const createMockClothingItem = (overrides?: Partial<ClothingItem>): ClothingItem => ({
  id: 'test-item-1',
  image: 'test-image-id',
  category: 'top',
  colors: ['blue', 'white'],
  style: ['casual'],
  uploadedAt: new Date('2025-01-01'),
  ...overrides,
})

export const createMockUserProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  hasCompletedOnboarding: true,
  stylePreferences: {
    casual: 8,
    formal: 3,
    streetwear: 5,
    athletic: 4,
    preppy: 2,
  },
  favoriteColors: ['blue', 'black', 'white'],
  ...overrides,
})

export const createMockWeatherData = (overrides?: Partial<WeatherData>): WeatherData => ({
  temperature: 65,
  condition: 'clear',
  precipitation: 0,
  humidity: 50,
  windSpeed: 5,
  ...overrides,
})
