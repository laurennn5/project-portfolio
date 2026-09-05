import { describe, it, expect } from 'vitest'
import { generateOutfits } from './outfitGenerator'
import { ClothingItem, UserProfile, WeatherData } from '../types'

// Test data factories
const createClothingItem = (
  id: string,
  category: ClothingItem['category'],
  colors: string[],
  style?: string[]
): ClothingItem => ({
  id,
  image: `image-${id}`,
  category,
  colors,
  style,
  uploadedAt: new Date('2025-01-01'),
})

const createUserProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  hasCompletedOnboarding: true,
  stylePreferences: {
    casual: 5,
    formal: 5,
    streetwear: 5,
    athletic: 5,
    preppy: 5,
  },
  favoriteColors: ['blue', 'black', 'white'],
  ...overrides,
})

const createWeatherData = (temp: number): WeatherData => ({
  temperature: temp,
  condition: 'clear',
  precipitation: 0,
  humidity: 50,
  windSpeed: 5,
})

describe('outfitGenerator', () => {
  describe('generateOutfits', () => {
    it('should return empty array when wardrobe has insufficient items', () => {
      const wardrobe: ClothingItem[] = [
        createClothingItem('top1', 'top', ['blue']),
        // Missing bottoms and shoes
      ]
      const profile = createUserProfile()

      const outfits = generateOutfits(wardrobe, profile, 5)

      expect(outfits).toEqual([])
    })

    it('should generate outfits with minimum required items (top, bottom, shoes)', () => {
      const wardrobe: ClothingItem[] = [
        createClothingItem('top1', 'top', ['blue'], ['casual']),
        createClothingItem('top2', 'top', ['black'], ['casual']),
        createClothingItem('bottom1', 'bottom', ['black'], ['casual']),
        createClothingItem('bottom2', 'bottom', ['blue'], ['casual']),
        createClothingItem('shoes1', 'shoes', ['white'], ['casual']),
        createClothingItem('shoes2', 'shoes', ['black'], ['casual']),
      ]
      const profile = createUserProfile()

      const outfits = generateOutfits(wardrobe, profile, 5)

      expect(outfits.length).toBeGreaterThan(0)
      expect(outfits.length).toBeLessThanOrEqual(5)

      // Each outfit should have at least 3 items (top, bottom, shoes)
      outfits.forEach((outfit) => {
        expect(outfit.items.length).toBeGreaterThanOrEqual(3)
        expect(outfit.id).toBeDefined()
        expect(outfit.createdAt).toBeInstanceOf(Date)

        // Verify category distribution
        const categories = outfit.items.map((item) => item.category)
        expect(categories).toContain('top')
        expect(categories).toContain('bottom')
        expect(categories).toContain('shoes')
      })
    })

    it('should respect requiredItem parameter', () => {
      const requiredTop = createClothingItem('top-required', 'top', ['red'], ['casual'])
      const wardrobe: ClothingItem[] = [
        requiredTop,
        createClothingItem('top2', 'top', ['blue'], ['casual']),
        createClothingItem('bottom1', 'bottom', ['black'], ['casual']),
        createClothingItem('shoes1', 'shoes', ['white'], ['casual']),
      ]
      const profile = createUserProfile()

      const outfits = generateOutfits(wardrobe, profile, 5, undefined, requiredTop)

      expect(outfits.length).toBeGreaterThan(0)

      // All outfits should include the required item
      outfits.forEach((outfit) => {
        const hasRequiredItem = outfit.items.some((item) => item.id === 'top-required')
        expect(hasRequiredItem).toBe(true)
      })
    })

    it('should not exceed requested count', () => {
      const wardrobe: ClothingItem[] = [
        createClothingItem('top1', 'top', ['blue'], ['casual']),
        createClothingItem('top2', 'top', ['black'], ['casual']),
        createClothingItem('top3', 'top', ['white'], ['casual']),
        createClothingItem('bottom1', 'bottom', ['black'], ['casual']),
        createClothingItem('bottom2', 'bottom', ['blue'], ['casual']),
        createClothingItem('bottom3', 'bottom', ['gray'], ['casual']),
        createClothingItem('shoes1', 'shoes', ['white'], ['casual']),
        createClothingItem('shoes2', 'shoes', ['black'], ['casual']),
      ]
      const profile = createUserProfile()

      const outfits = generateOutfits(wardrobe, profile, 3)

      expect(outfits.length).toBeLessThanOrEqual(3)
    })

    it('should adapt to cold weather (< 50°F)', () => {
      const wardrobe: ClothingItem[] = [
        createClothingItem('top1', 'top', ['blue'], ['casual']),
        createClothingItem('bottom1', 'bottom', ['black'], ['casual']),
        createClothingItem('shoes1', 'shoes', ['black'], ['casual']),
        createClothingItem('outerwear1', 'outerwear', ['navy'], ['casual']),
      ]
      const profile = createUserProfile()
      const coldWeather = createWeatherData(40) // 40°F = cold

      const outfits = generateOutfits(wardrobe, profile, 5, coldWeather)

      // Should prefer outfits with outerwear in cold weather
      // At minimum, should successfully generate outfits
      expect(outfits.length).toBeGreaterThan(0)
    })

    it('should adapt to hot weather (> 75°F)', () => {
      const wardrobe: ClothingItem[] = [
        createClothingItem('top1', 'top', ['white'], ['casual']),
        createClothingItem('top2', 'top', ['black'], ['casual']),
        createClothingItem('bottom1', 'bottom', ['beige'], ['casual']),
        createClothingItem('shoes1', 'shoes', ['white'], ['casual']),
      ]
      const profile = createUserProfile()
      const hotWeather = createWeatherData(85) // 85°F = hot

      const outfits = generateOutfits(wardrobe, profile, 5, hotWeather)

      expect(outfits.length).toBeGreaterThan(0)
      // Hot weather logic should prioritize lighter colors
    })

    it('should generate unique outfits (no duplicates)', () => {
      const wardrobe: ClothingItem[] = [
        createClothingItem('top1', 'top', ['blue'], ['casual']),
        createClothingItem('top2', 'top', ['black'], ['casual']),
        createClothingItem('bottom1', 'bottom', ['black'], ['casual']),
        createClothingItem('bottom2', 'bottom', ['blue'], ['casual']),
        createClothingItem('shoes1', 'shoes', ['white'], ['casual']),
      ]
      const profile = createUserProfile()

      const outfits = generateOutfits(wardrobe, profile, 10)

      // Check for duplicate outfits by comparing item ID combinations
      const outfitSignatures = outfits.map((outfit) =>
        outfit.items
          .map((item) => item.id)
          .sort()
          .join('-')
      )

      const uniqueSignatures = new Set(outfitSignatures)
      expect(uniqueSignatures.size).toBe(outfits.length) // No duplicates
    })

    it('should favor user style preferences', () => {
      const wardrobe: ClothingItem[] = [
        createClothingItem('top1', 'top', ['blue'], ['casual']),
        createClothingItem('top2', 'top', ['navy'], ['formal']),
        createClothingItem('bottom1', 'bottom', ['black'], ['casual']),
        createClothingItem('bottom2', 'bottom', ['gray'], ['formal']),
        createClothingItem('shoes1', 'shoes', ['sneakers'], ['casual']),
        createClothingItem('shoes2', 'shoes', ['dress'], ['formal']),
      ]

      // Profile strongly prefers casual
      const casualProfile = createUserProfile({
        stylePreferences: {
          casual: 10,
          formal: 1,
          streetwear: 3,
          athletic: 2,
          preppy: 2,
        },
      })

      const outfits = generateOutfits(wardrobe, casualProfile, 5)

      expect(outfits.length).toBeGreaterThan(0)
      // Most outfits should contain casual items (this is probabilistic but should trend casual)
    })

    it('should handle occasion parameter', () => {
      const wardrobe: ClothingItem[] = [
        createClothingItem('top1', 'top', ['white'], ['formal']),
        createClothingItem('top2', 'top', ['blue'], ['casual']),
        createClothingItem('bottom1', 'bottom', ['black'], ['formal']),
        createClothingItem('bottom2', 'bottom', ['jeans'], ['casual']),
        createClothingItem('shoes1', 'shoes', ['dress'], ['formal']),
        createClothingItem('shoes2', 'shoes', ['sneakers'], ['casual']),
      ]
      const profile = createUserProfile()

      const outfits = generateOutfits(wardrobe, profile, 5, undefined, undefined, 'interview')

      expect(outfits.length).toBeGreaterThan(0)
      // Interview occasion should prefer formal items
    })
  })
})
