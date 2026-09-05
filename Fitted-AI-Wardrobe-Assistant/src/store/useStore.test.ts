import { describe, it, expect, beforeEach, vi, afterEach, beforeAll, afterAll } from 'vitest'
import { useStore } from './useStore'
import { ClothingItem, Outfit, WeatherData, QueuedFile } from '../types'
import * as api from '../services/api'

// Mocks for batch upload dependencies
vi.mock('../utils/imageFormatConverter', () => ({
  convertImageIfNeeded: vi.fn((file) => Promise.resolve(file)),
}))

vi.mock('../utils/backgroundRemoval', () => ({
  processImageForAI: vi.fn((file) => Promise.resolve(new Blob(['processed'], { type: 'image/png' }))),
}))

vi.mock('../utils/imageCompression', () => ({
  compressImage: vi.fn((file) => Promise.resolve(new Blob(['compressed'], { type: 'image/jpeg' }))),
  extractColors: vi.fn(() => Promise.resolve(['#000000'])),
  compressForAI: vi.fn(() => Promise.resolve('base64-string')),
}))

vi.mock('../utils/storage', () => ({
  saveImage: vi.fn(() => Promise.resolve()),
}))

// Mock FileReader
const originalFileReader = global.FileReader
class MockFileReader {
  result = ''
  onload: any = null
  onerror: any = null
  readAsDataURL() {
    this.result = 'data:image/png;base64,mock-base64'
    if (this.onload) {
      this.onload({ target: { result: this.result } })
    }
  }
}

describe('useStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useStore.setState({
      wardrobe: [],
      outfitHistory: [],
      todaysPick: null,
      profile: {
        hasCompletedOnboarding: false,
        stylePreferences: {
          casual: 5,
          formal: 5,
          streetwear: 5,
          athletic: 5,
          preppy: 5,
        },
        favoriteColors: [],
      },
      // Batch upload state
      batchUploadQueue: [],
      batchUploadStatus: 'idle',
      batchUploadProgress: {
        totalFiles: 0,
        processedCount: 0,
        successCount: 0,
        errorCount: 0,
      },
      shouldContinueBatchUpload: true,
    })
  })

  beforeAll(() => {
    global.FileReader = MockFileReader as any
  })

  afterAll(() => {
    global.FileReader = originalFileReader
  })

  describe('Wardrobe Management', () => {
    it('should add clothing item to wardrobe', () => {
      const newItem: ClothingItem = {
        id: 'test-1',
        image: 'image-1',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(newItem)

      const wardrobe = useStore.getState().wardrobe
      expect(wardrobe).toHaveLength(1)
      expect(wardrobe[0]).toEqual(newItem)
    })

    it('should remove clothing item from wardrobe', () => {
      const item1: ClothingItem = {
        id: 'test-1',
        image: 'image-1',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }
      const item2: ClothingItem = {
        id: 'test-2',
        image: 'image-2',
        category: 'bottom',
        colors: ['black'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)

      expect(useStore.getState().wardrobe).toHaveLength(2)

      useStore.getState().removeClothingItem('test-1')

      const wardrobe = useStore.getState().wardrobe
      expect(wardrobe).toHaveLength(1)
      expect(wardrobe[0].id).toBe('test-2')
    })

    it('should update clothing item', () => {
      const item: ClothingItem = {
        id: 'test-1',
        image: 'image-1',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item)

      useStore.getState().updateClothingItem('test-1', {
        colors: ['red', 'blue'],
        style: ['casual'],
      })

      const updatedItem = useStore.getState().wardrobe[0]
      expect(updatedItem.colors).toEqual(['red', 'blue'])
      expect(updatedItem.style).toEqual(['casual'])
    })

    it('should clear entire wardrobe', () => {
      const item1: ClothingItem = {
        id: 'test-1',
        image: 'image-1',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }
      const item2: ClothingItem = {
        id: 'test-2',
        image: 'image-2',
        category: 'bottom',
        colors: ['black'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)

      expect(useStore.getState().wardrobe).toHaveLength(2)

      useStore.getState().clearWardrobe()

      expect(useStore.getState().wardrobe).toHaveLength(0)
    })
  })

  describe('Profile Management', () => {
    it('should update user profile', () => {
      useStore.getState().setProfile({
        hasCompletedOnboarding: true,
        stylePreferences: {
          casual: 8,
          formal: 2,
          streetwear: 5,
          athletic: 3,
          preppy: 1,
        },
        favoriteColors: ['blue', 'black'],
      })

      const profile = useStore.getState().profile
      expect(profile.hasCompletedOnboarding).toBe(true)
      expect(profile.stylePreferences.casual).toBe(8)
      expect(profile.favoriteColors).toEqual(['blue', 'black'])
    })

    it('should update style preferences', () => {
      useStore.getState().updateStylePreferences({
        casual: 10,
        formal: 1,
      })

      const preferences = useStore.getState().profile.stylePreferences
      expect(preferences.casual).toBe(10)
      expect(preferences.formal).toBe(1)
      // Other preferences should remain default
      expect(preferences.streetwear).toBe(5)
    })

    it('should update favorite colors', () => {
      useStore.getState().updateFavoriteColors(['red', 'green', 'blue'])

      const colors = useStore.getState().profile.favoriteColors
      expect(colors).toEqual(['red', 'green', 'blue'])
    })
  })

  describe('Outfit Management', () => {
    it('should add outfit', () => {
      const outfit = {
        id: 'outfit-1',
        items: [],
        createdAt: new Date(),
      }

      useStore.getState().addOutfit(outfit)

      expect(useStore.getState().outfitHistory).toHaveLength(1)
      expect(useStore.getState().outfitHistory[0]).toEqual(outfit)
    })

    it('should set today\'s pick', () => {
      const outfit = {
        id: 'outfit-1',
        items: [],
        createdAt: new Date(),
      }

      useStore.getState().setTodaysPick(outfit)

      expect(useStore.getState().todaysPick).toEqual(outfit)
    })

    it('should clear today\'s pick', () => {
      const outfit = {
        id: 'outfit-1',
        items: [],
        createdAt: new Date(),
      }

      useStore.getState().setTodaysPick(outfit)
      expect(useStore.getState().todaysPick).toEqual(outfit)

      useStore.getState().clearTodaysPick()
      expect(useStore.getState().todaysPick).toBeNull()
    })
  })

  describe('Wardrobe Stats', () => {
    it('should calculate wardrobe statistics correctly', () => {
      // Add items to meet minimum requirements
      const tops = [
        { id: 't1', image: 'img', category: 'top' as const, colors: ['blue'], uploadedAt: new Date() },
        { id: 't2', image: 'img', category: 'top' as const, colors: ['red'], uploadedAt: new Date() },
        { id: 't3', image: 'img', category: 'top' as const, colors: ['black'], uploadedAt: new Date() },
        { id: 't4', image: 'img', category: 'top' as const, colors: ['white'], uploadedAt: new Date() },
        { id: 't5', image: 'img', category: 'top' as const, colors: ['green'], uploadedAt: new Date() },
      ]
      const bottoms = [
        { id: 'b1', image: 'img', category: 'bottom' as const, colors: ['blue'], uploadedAt: new Date() },
        { id: 'b2', image: 'img', category: 'bottom' as const, colors: ['black'], uploadedAt: new Date() },
        { id: 'b3', image: 'img', category: 'bottom' as const, colors: ['gray'], uploadedAt: new Date() },
      ]
      const shoes = [
        { id: 's1', image: 'img', category: 'shoes' as const, colors: ['white'], uploadedAt: new Date() },
        { id: 's2', image: 'img', category: 'shoes' as const, colors: ['black'], uploadedAt: new Date() },
      ]

      tops.forEach((item) => useStore.getState().addClothingItem(item))
      bottoms.forEach((item) => useStore.getState().addClothingItem(item))
      shoes.forEach((item) => useStore.getState().addClothingItem(item))

      const stats = useStore.getState().getWardrobeStats()

      expect(stats.total).toBe(10)
      expect(stats.tops).toBe(5)
      expect(stats.bottoms).toBe(3)
      expect(stats.shoes).toBe(2)
      expect(stats.canSwipe).toBe(true) // Meets minimum: 5 tops, 3 bottoms, 2 shoes
    })

    it('should indicate canSwipe false when minimum not met', () => {
      const item: ClothingItem = {
        id: 'test-1',
        image: 'image-1',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item)

      const stats = useStore.getState().getWardrobeStats()

      expect(stats.canSwipe).toBe(false)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    describe('updateClothingItem edge cases', () => {
      it('should handle non-existent item ID gracefully', () => {
        const initialCount = useStore.getState().wardrobe.length
        useStore.getState().updateClothingItem('non-existent', { colors: ['red'] })
        expect(useStore.getState().wardrobe).toHaveLength(initialCount)
      })

      it('should ignore attempts to change item ID', () => {
        const item: ClothingItem = {
          id: 'original-id',
          image: 'img',
          category: 'top',
          colors: ['blue'],
          uploadedAt: new Date(),
        }
        useStore.getState().addClothingItem(item)

        useStore.getState().updateClothingItem('original-id', {
          id: 'hacked-id',
          colors: ['red'],
        } as any)

        expect(useStore.getState().wardrobe[0].id).toBe('original-id')
        expect(useStore.getState().wardrobe[0].colors).toEqual(['red'])
      })

      it('should handle empty updates object', () => {
        const item: ClothingItem = {
          id: 'test-1',
          image: 'img',
          category: 'top',
          colors: ['blue'],
          uploadedAt: new Date(),
        }
        useStore.getState().addClothingItem(item)

        useStore.getState().updateClothingItem('test-1', {})
        expect(useStore.getState().wardrobe[0]).toEqual(item)
      })
    })

    describe('updateStylePreferences edge cases', () => {
      it('should clamp values to 0-10 range', () => {
        useStore.getState().updateStylePreferences({
          casual: 15,
          formal: -5,
        })

        const prefs = useStore.getState().profile.stylePreferences
        expect(prefs.casual).toBe(10)
        expect(prefs.formal).toBe(0)
      })

      it('should ignore invalid style keys', () => {
        useStore.getState().updateStylePreferences({
          invalidKey: 8,
        } as any)

        expect(useStore.getState().profile.stylePreferences).not.toHaveProperty('invalidKey')
      })

      it('should ignore non-numeric values', () => {
        const original = useStore.getState().profile.stylePreferences.casual

        useStore.getState().updateStylePreferences({
          casual: 'not a number' as any,
        })

        expect(useStore.getState().profile.stylePreferences.casual).toBe(original)
      })
    })

    describe('updateFavoriteColors edge cases', () => {
      it('should handle empty array', () => {
        useStore.getState().updateFavoriteColors([])
        expect(useStore.getState().profile.favoriteColors).toEqual([])
      })

      it('should remove duplicates', () => {
        useStore.getState().updateFavoriteColors(['red', 'blue', 'red', 'green', 'blue'])
        expect(useStore.getState().profile.favoriteColors).toEqual(['red', 'blue', 'green'])
      })

      it('should filter out non-string values', () => {
        useStore.getState().updateFavoriteColors(['red', 123, null, 'blue'] as any)
        expect(useStore.getState().profile.favoriteColors).toEqual(['red', 'blue'])
      })

      it('should handle non-array input gracefully', () => {
        const original = useStore.getState().profile.favoriteColors
        useStore.getState().updateFavoriteColors('not an array' as any)
        expect(useStore.getState().profile.favoriteColors).toEqual(original)
      })
    })

    describe('clearWardrobe edge cases', () => {
      it('should clear all related data', () => {
        const item: ClothingItem = {
          id: 't1',
          image: 'img',
          category: 'top',
          colors: ['blue'],
          uploadedAt: new Date(),
        }
        useStore.getState().addClothingItem(item)

        const outfit = {
          id: 'outfit-1',
          items: [item],
          createdAt: new Date(),
        }
        useStore.getState().addOutfit(outfit)
        useStore.getState().setTodaysPick(outfit)

        useStore.getState().clearWardrobe()

        expect(useStore.getState().wardrobe).toHaveLength(0)
        expect(useStore.getState().outfitHistory).toHaveLength(0)
        expect(useStore.getState().todaysPick).toBeNull()
      })

      it('should work when wardrobe already empty', () => {
        useStore.getState().clearWardrobe()
        expect(useStore.getState().wardrobe).toHaveLength(0)
      })
    })

    describe('getWardrobeStats edge cases', () => {
      it('should return all zeros for empty wardrobe', () => {
        const stats = useStore.getState().getWardrobeStats()
        expect(stats.total).toBe(0)
        expect(stats.tops).toBe(0)
        expect(stats.bottoms).toBe(0)
        expect(stats.shoes).toBe(0)
        expect(stats.canSwipe).toBe(false)
      })

      it('should correctly count all categories', () => {
        useStore.getState().addClothingItem({ id: '1', image: 'i', category: 'top', colors: [], uploadedAt: new Date() })
        useStore.getState().addClothingItem({ id: '2', image: 'i', category: 'top', colors: [], uploadedAt: new Date() })
        useStore.getState().addClothingItem({ id: '3', image: 'i', category: 'bottom', colors: [], uploadedAt: new Date() })
        useStore.getState().addClothingItem({ id: '4', image: 'i', category: 'shoes', colors: [], uploadedAt: new Date() })
        useStore.getState().addClothingItem({ id: '5', image: 'i', category: 'accessory', colors: [], uploadedAt: new Date() })
        useStore.getState().addClothingItem({ id: '6', image: 'i', category: 'outerwear', colors: [], uploadedAt: new Date() })

        const stats = useStore.getState().getWardrobeStats()
        expect(stats.total).toBe(6)
        expect(stats.tops).toBe(2)
        expect(stats.bottoms).toBe(1)
        expect(stats.shoes).toBe(1)
        expect(stats.accessories).toBe(1)
        expect(stats.outerwear).toBe(1)
      })
    })
  })

  describe('Async Methods - fetchWeather()', () => {
    const mockWeather: WeatherData = {
      temperature: 72,
      condition: 'Sunny',
      precipitation: 10,
      windSpeed: 5,
      humidity: 60,
      feelsLike: 70,
    }

    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear()
      vi.clearAllMocks()
    })

    afterEach(() => {
      localStorage.clear()
    })

    describe('Cache behavior', () => {
      it('should return cached weather if cache is valid (< 30 min old)', async () => {
        // Setup: Add valid cache
        const cacheData = {
          weather: mockWeather,
          cachedAt: new Date().toISOString(), // Fresh cache
        }
        localStorage.setItem('fitted_weather_cache', JSON.stringify(cacheData))

        // Spy on API to ensure it's NOT called
        const getWeatherSpy = vi.spyOn(api, 'getWeather')

        await useStore.getState().fetchWeather()

        // Should return cached data without API call
        expect(useStore.getState().weatherData).toEqual(mockWeather)
        expect(useStore.getState().weatherLoading).toBe(false)
        expect(useStore.getState().weatherError).toBeNull()
        expect(getWeatherSpy).not.toHaveBeenCalled()
      })

      it('should fetch new data if cache is expired (> 30 min old)', async () => {
        // Setup: Add expired cache (31 minutes ago)
        const oldDate = new Date(Date.now() - 31 * 60 * 1000)
        const expiredCache = {
          weather: mockWeather,
          cachedAt: oldDate.toISOString(),
        }
        localStorage.setItem('fitted_weather_cache', JSON.stringify(expiredCache))

        // Setup: Profile with location
        useStore.setState({
          profile: {
            ...useStore.getState().profile,
            location: { latitude: 47.6062, longitude: -122.3321 },
          },
        })

        // Mock API success
        vi.spyOn(api, 'getWeather').mockResolvedValue({
          success: true,
          weather: mockWeather,
        })

        await useStore.getState().fetchWeather()

        // Should call API because cache expired
        expect(api.getWeather).toHaveBeenCalledWith(47.6062, -122.3321)
        expect(useStore.getState().weatherData).toEqual(mockWeather)
      })

      it('should handle invalid cached data gracefully', async () => {
        // Setup: Invalid cache data
        localStorage.setItem('fitted_weather_cache', 'invalid json{')

        // Setup: Profile with location
        useStore.setState({
          profile: {
            ...useStore.getState().profile,
            location: { latitude: 47.6062, longitude: -122.3321 },
          },
        })

        // Mock API success
        vi.spyOn(api, 'getWeather').mockResolvedValue({
          success: true,
          weather: mockWeather,
        })

        await useStore.getState().fetchWeather()

        // Should fetch from API (cache invalid)
        expect(api.getWeather).toHaveBeenCalled()
        expect(useStore.getState().weatherData).toEqual(mockWeather)
      })
    })

    describe('Location handling', () => {
      it('should use profile location if available', async () => {
        // Setup: Profile with location
        useStore.setState({
          profile: {
            ...useStore.getState().profile,
            location: {
              latitude: 47.6062,
              longitude: -122.3321,
              city: 'Seattle',
            },
          },
        })

        // Mock API
        const getWeatherSpy = vi.spyOn(api, 'getWeather').mockResolvedValue({
          success: true,
          weather: mockWeather,
        })

        await useStore.getState().fetchWeather()

        expect(getWeatherSpy).toHaveBeenCalledWith(47.6062, -122.3321)
        expect(useStore.getState().weatherData).toEqual(mockWeather)
      })

      it('should fallback to geolocation if profile location not set', async () => {
        // Setup: No profile location
        useStore.setState({
          profile: {
            ...useStore.getState().profile,
            location: undefined,
          },
        })

        // Mock geolocation success
        vi.spyOn(api, 'getUserLocation').mockResolvedValue({
          latitude: 40.7128,
          longitude: -74.006,
        })

        // Mock weather API
        vi.spyOn(api, 'getWeather').mockResolvedValue({
          success: true,
          weather: mockWeather,
        })

        await useStore.getState().fetchWeather()

        expect(api.getUserLocation).toHaveBeenCalled()
        expect(api.getWeather).toHaveBeenCalledWith(40.7128, -74.006)
        expect(useStore.getState().weatherData).toEqual(mockWeather)
      })

      it('should set error if geolocation denied', async () => {
        // Setup: No profile location AND clear any cached weather
        useStore.setState({
          profile: {
            ...useStore.getState().profile,
            location: undefined,
          },
          weatherData: null, // Clear previous weather data
          weatherError: null,
          weatherLoading: false,
        })

        // Mock geolocation denial
        vi.spyOn(api, 'getUserLocation').mockRejectedValue(
          new Error('User denied geolocation')
        )

        await useStore.getState().fetchWeather()

        expect(useStore.getState().weatherError).toBe(
          'Location access required for weather data'
        )
        expect(useStore.getState().weatherData).toBeNull()
        expect(useStore.getState().weatherLoading).toBe(false)
      })
    })

    describe('API calls', () => {
      beforeEach(() => {
        // Setup: Profile with location for these tests
        useStore.setState({
          profile: {
            ...useStore.getState().profile,
            location: { latitude: 47.6062, longitude: -122.3321 },
          },
        })
      })

      it('should handle successful API response', async () => {
        vi.spyOn(api, 'getWeather').mockResolvedValue({
          success: true,
          weather: mockWeather,
        })

        await useStore.getState().fetchWeather()

        // Verify state
        expect(useStore.getState().weatherData).toEqual(mockWeather)
        expect(useStore.getState().weatherError).toBeNull()
        expect(useStore.getState().weatherLoading).toBe(false)

        // Verify cache was saved
        const cached = localStorage.getItem('fitted_weather_cache')
        expect(cached).toBeTruthy()
        const parsedCache = JSON.parse(cached!)
        expect(parsedCache.weather).toEqual(mockWeather)
      })

      it('should handle API failure (success: false)', async () => {
        vi.spyOn(api, 'getWeather').mockResolvedValue({
          success: false,
          error: 'API rate limit exceeded',
        })

        await useStore.getState().fetchWeather()

        expect(useStore.getState().weatherData).toBeNull()
        expect(useStore.getState().weatherError).toBe('API rate limit exceeded')
        expect(useStore.getState().weatherLoading).toBe(false)
      })

      it('should handle network errors', async () => {
        vi.spyOn(api, 'getWeather').mockRejectedValue(
          new Error('Network timeout')
        )

        await useStore.getState().fetchWeather()

        expect(useStore.getState().weatherData).toBeNull()
        expect(useStore.getState().weatherError).toBe('Network timeout')
        expect(useStore.getState().weatherLoading).toBe(false)
      })

      it('should handle generic errors without message', async () => {
        vi.spyOn(api, 'getWeather').mockRejectedValue(new Error())

        await useStore.getState().fetchWeather()

        expect(useStore.getState().weatherError).toBe('Failed to fetch weather')
      })
    })

    describe('State transitions', () => {
      it('should set loading state during fetch', async () => {
        useStore.setState({
          profile: {
            ...useStore.getState().profile,
            location: { latitude: 47.6062, longitude: -122.3321 },
          },
        })

        // Create a promise we can control
        let resolveWeather: any
        const weatherPromise = new Promise((resolve) => {
          resolveWeather = resolve
        })

        vi.spyOn(api, 'getWeather').mockReturnValue(weatherPromise as any)

        // Start fetch (don't await)
        const fetchPromise = useStore.getState().fetchWeather()

        // Check loading state immediately
        expect(useStore.getState().weatherLoading).toBe(true)

        // Resolve the promise
        resolveWeather({ success: true, weather: mockWeather })
        await fetchPromise

        // Check final state
        expect(useStore.getState().weatherLoading).toBe(false)
      })

      it('should clear error on successful fetch', async () => {
        // Setup: Existing error state
        useStore.setState({
          weatherError: 'Previous error',
          profile: {
            ...useStore.getState().profile,
            location: { latitude: 47.6062, longitude: -122.3321 },
          },
        })

        vi.spyOn(api, 'getWeather').mockResolvedValue({
          success: true,
          weather: mockWeather,
        })

        await useStore.getState().fetchWeather()

        expect(useStore.getState().weatherError).toBeNull()
      })
    })

    describe('clearWeatherCache()', () => {
      it('should clear cache and weather data', () => {
        // Setup: Set cache and weather data
        localStorage.setItem('fitted_weather_cache', JSON.stringify({ test: 'data' }))
        useStore.setState({ weatherData: mockWeather })

        useStore.getState().clearWeatherCache()

        expect(localStorage.getItem('fitted_weather_cache')).toBeNull()
        expect(useStore.getState().weatherData).toBeNull()
      })
    })
  })

  describe('Async Methods - removeClothingItem() Cascade Deletes', () => {
    it('should remove item from wardrobe', () => {
      const item1: ClothingItem = {
        id: 'item-1',
        image: 'img',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }
      const item2: ClothingItem = {
        id: 'item-2',
        image: 'img',
        category: 'bottom',
        colors: ['black'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)

      expect(useStore.getState().wardrobe).toHaveLength(2)

      useStore.getState().removeClothingItem('item-1')

      expect(useStore.getState().wardrobe).toHaveLength(1)
      expect(useStore.getState().wardrobe[0].id).toBe('item-2')
    })

    it('should remove outfits containing the deleted item', () => {
      const item1: ClothingItem = {
        id: 'item-1',
        image: 'img',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }
      const item2: ClothingItem = {
        id: 'item-2',
        image: 'img',
        category: 'bottom',
        colors: ['black'],
        uploadedAt: new Date(),
      }
      const item3: ClothingItem = {
        id: 'item-3',
        image: 'img',
        category: 'shoes',
        colors: ['white'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)
      useStore.getState().addClothingItem(item3)

      // Create outfits
      const outfit1: Outfit = {
        id: 'outfit-1',
        items: [item1, item2], // Contains item1
        createdAt: new Date(),
      }
      const outfit2: Outfit = {
        id: 'outfit-2',
        items: [item2, item3], // Does NOT contain item1
        createdAt: new Date(),
      }
      const outfit3: Outfit = {
        id: 'outfit-3',
        items: [item1, item2, item3], // Contains item1
        createdAt: new Date(),
      }

      useStore.getState().addOutfit(outfit1)
      useStore.getState().addOutfit(outfit2)
      useStore.getState().addOutfit(outfit3)

      expect(useStore.getState().outfitHistory).toHaveLength(3)

      // Remove item1
      useStore.getState().removeClothingItem('item-1')

      // Only outfit2 should remain (doesn't contain item1)
      expect(useStore.getState().outfitHistory).toHaveLength(1)
      expect(useStore.getState().outfitHistory[0].id).toBe('outfit-2')
    })

    it('should clear todaysPick if it contains the deleted item', () => {
      const item1: ClothingItem = {
        id: 'item-1',
        image: 'img',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }
      const item2: ClothingItem = {
        id: 'item-2',
        image: 'img',
        category: 'bottom',
        colors: ['black'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)

      const outfit: Outfit = {
        id: 'outfit-1',
        items: [item1, item2],
        createdAt: new Date(),
      }

      useStore.getState().setTodaysPick(outfit)
      expect(useStore.getState().todaysPick).toEqual(outfit)

      // Remove item1 (part of todaysPick)
      useStore.getState().removeClothingItem('item-1')

      expect(useStore.getState().todaysPick).toBeNull()
    })

    it('should NOT clear todaysPick if it does not contain deleted item', () => {
      const item1: ClothingItem = {
        id: 'item-1',
        image: 'img',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }
      const item2: ClothingItem = {
        id: 'item-2',
        image: 'img',
        category: 'bottom',
        colors: ['black'],
        uploadedAt: new Date(),
      }
      const item3: ClothingItem = {
        id: 'item-3',
        image: 'img',
        category: 'shoes',
        colors: ['white'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)
      useStore.getState().addClothingItem(item3)

      const outfit: Outfit = {
        id: 'outfit-1',
        items: [item2, item3], // Does NOT contain item1
        createdAt: new Date(),
      }

      useStore.getState().setTodaysPick(outfit)

      // Remove item1 (NOT in todaysPick)
      useStore.getState().removeClothingItem('item-1')

      expect(useStore.getState().todaysPick).toEqual(outfit)
    })

    it('should remove from dailySuggestions if present', () => {
      const item1: ClothingItem = {
        id: 'item-1',
        image: 'img',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }
      const item2: ClothingItem = {
        id: 'item-2',
        image: 'img',
        category: 'bottom',
        colors: ['black'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)

      const suggestion1: Outfit = {
        id: 'sug-1',
        items: [item1, item2], // Contains item1
        createdAt: new Date(),
      }
      const suggestion2: Outfit = {
        id: 'sug-2',
        items: [item2], // Does NOT contain item1
        createdAt: new Date(),
      }

      useStore.getState().setDailySuggestions([suggestion1, suggestion2])

      expect(useStore.getState().dailySuggestions).toHaveLength(2)

      // Remove item1
      useStore.getState().removeClothingItem('item-1')

      // Only suggestion2 should remain
      expect(useStore.getState().dailySuggestions).toHaveLength(1)
      expect(useStore.getState().dailySuggestions[0].id).toBe('sug-2')
    })

    it('should handle removing non-existent item gracefully', () => {
      const item1: ClothingItem = {
        id: 'item-1',
        image: 'img',
        category: 'top',
        colors: ['blue'],
        uploadedAt: new Date(),
      }

      useStore.getState().addClothingItem(item1)

      const initialWardrobe = useStore.getState().wardrobe

      // Remove non-existent item
      useStore.getState().removeClothingItem('non-existent-id')

      // Wardrobe should remain unchanged
      expect(useStore.getState().wardrobe).toEqual(initialWardrobe)
    })
  })

  describe('Async Methods - addOutfit() Duplicate Detection', () => {
    const item1: ClothingItem = {
      id: 'item-1',
      image: 'img',
      category: 'top',
      colors: ['blue'],
      uploadedAt: new Date(),
    }
    const item2: ClothingItem = {
      id: 'item-2',
      image: 'img',
      category: 'bottom',
      colors: ['black'],
      uploadedAt: new Date(),
    }

    beforeEach(() => {
      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)
    })

    it('should add non-duplicate outfit', () => {
      const outfit: Outfit = {
        id: 'outfit-1',
        items: [item1, item2],
        createdAt: new Date(),
      }

      useStore.getState().addOutfit(outfit)

      expect(useStore.getState().outfitHistory).toHaveLength(1)
      expect(useStore.getState().outfitHistory[0]).toEqual(outfit)
    })

    it('should prevent duplicate outfit (same items, same order)', () => {
      const outfit1: Outfit = {
        id: 'outfit-1',
        items: [item1, item2],
        createdAt: new Date(),
      }
      const outfit2: Outfit = {
        id: 'outfit-2', // Different ID
        items: [item1, item2], // Same items, same order
        createdAt: new Date(),
      }

      useStore.getState().addOutfit(outfit1)
      expect(useStore.getState().outfitHistory).toHaveLength(1)

      useStore.getState().addOutfit(outfit2)

      // Should still be 1 (duplicate prevented)
      expect(useStore.getState().outfitHistory).toHaveLength(1)
      expect(useStore.getState().outfitHistory[0].id).toBe('outfit-1')
    })

    it('should prevent duplicate outfit (same items, different order)', () => {
      const outfit1: Outfit = {
        id: 'outfit-1',
        items: [item1, item2],
        createdAt: new Date(),
      }
      const outfit2: Outfit = {
        id: 'outfit-2',
        items: [item2, item1], // REVERSED order, same items
        createdAt: new Date(),
      }

      useStore.getState().addOutfit(outfit1)
      useStore.getState().addOutfit(outfit2)

      // Should prevent duplicate (order doesn't matter)
      expect(useStore.getState().outfitHistory).toHaveLength(1)
    })

    it('should add outfit with different items', () => {
      const item3: ClothingItem = {
        id: 'item-3',
        image: 'img',
        category: 'shoes',
        colors: ['white'],
        uploadedAt: new Date(),
      }
      useStore.getState().addClothingItem(item3)

      const outfit1: Outfit = {
        id: 'outfit-1',
        items: [item1, item2],
        createdAt: new Date(),
      }
      const outfit2: Outfit = {
        id: 'outfit-2',
        items: [item1, item3], // Different items
        createdAt: new Date(),
      }

      useStore.getState().addOutfit(outfit1)
      useStore.getState().addOutfit(outfit2)

      expect(useStore.getState().outfitHistory).toHaveLength(2)
    })

    it('should handle empty items array', () => {
      const emptyOutfit: Outfit = {
        id: 'empty-outfit',
        items: [],
        createdAt: new Date(),
      }

      useStore.getState().addOutfit(emptyOutfit)

      // Current implementation allows empty outfits
      expect(useStore.getState().outfitHistory).toHaveLength(1)
    })

    it('should handle outfit with single item', () => {
      const singleItemOutfit: Outfit = {
        id: 'single-outfit',
        items: [item1],
        createdAt: new Date(),
      }

      useStore.getState().addOutfit(singleItemOutfit)

      expect(useStore.getState().outfitHistory).toHaveLength(1)
      expect(useStore.getState().outfitHistory[0].items).toHaveLength(1)
    })
  })

  describe('removeDuplicateOutfits()', () => {
    const item1: ClothingItem = {
      id: 'item-1',
      image: 'img',
      category: 'top',
      colors: ['blue'],
      uploadedAt: new Date(),
    }
    const item2: ClothingItem = {
      id: 'item-2',
      image: 'img',
      category: 'bottom',
      colors: ['black'],
      uploadedAt: new Date(),
    }

    beforeEach(() => {
      useStore.getState().addClothingItem(item1)
      useStore.getState().addClothingItem(item2)
    })

    it('should remove duplicate outfits and keep first occurrence', () => {
      // Manually add duplicates to bypass addOutfit's duplicate prevention
      const outfit1: Outfit = {
        id: 'outfit-1',
        items: [item1, item2],
        createdAt: new Date('2024-01-01'),
      }
      const outfit2: Outfit = {
        id: 'outfit-2',
        items: [item2, item1], // Same items, different order
        createdAt: new Date('2024-01-02'),
      }
      const outfit3: Outfit = {
        id: 'outfit-3',
        items: [item1, item2], // Same items, same order
        createdAt: new Date('2024-01-03'),
      }

      // Directly set outfitHistory to bypass duplicate detection
      useStore.setState({
        outfitHistory: [outfit1, outfit2, outfit3],
      })

      expect(useStore.getState().outfitHistory).toHaveLength(3)

      useStore.getState().removeDuplicateOutfits()

      // Should keep only first occurrence
      expect(useStore.getState().outfitHistory).toHaveLength(1)
      expect(useStore.getState().outfitHistory[0].id).toBe('outfit-1')
    })

    it('should handle empty outfitHistory', () => {
      useStore.setState({ outfitHistory: [] })

      useStore.getState().removeDuplicateOutfits()

      expect(useStore.getState().outfitHistory).toHaveLength(0)
    })

    it('should keep non-duplicate outfits', () => {
      const item3: ClothingItem = {
        id: 'item-3',
        image: 'img',
        category: 'shoes',
        colors: ['white'],
        uploadedAt: new Date(),
      }
      useStore.getState().addClothingItem(item3)

      const outfit1: Outfit = {
        id: 'outfit-1',
        items: [item1, item2],
        createdAt: new Date(),
      }
      const outfit2: Outfit = {
        id: 'outfit-2',
        items: [item1, item3], // Different items
        createdAt: new Date(),
      }

      useStore.setState({
        outfitHistory: [outfit1, outfit2],
      })

      useStore.getState().removeDuplicateOutfits()

      // Both should remain (no duplicates)
      expect(useStore.getState().outfitHistory).toHaveLength(2)
    })
  })

  describe('Batch Upload', () => {
    const createMockFile = (name: string, type = 'image/jpeg', size = 1024) => {
      return new File([new Array(size).join('a')], name, { type })
    }

    describe('addBatchFiles()', () => {
      it('should add files to queue and set status to idle when done', async () => {
        const files = [createMockFile('test1.jpg'), createMockFile('test2.jpg')]

        // Mock AI analysis success
        vi.spyOn(api, 'analyzeClothing').mockResolvedValue({
          success: true,
          analysis: {
            suggestedCategory: 'top',
            confidence: 0.9,
            colors: ['blue'],
          } as any
        })

        await useStore.getState().addBatchFiles(files)

        const state = useStore.getState()
        expect(state.batchUploadQueue).toHaveLength(2)
        expect(state.batchUploadStatus).toBe('idle')
        expect(state.batchUploadQueue[0].originalName).toBe('test1.jpg')
        expect(state.batchUploadQueue[0].aiStatus).toBe('success')
        expect(state.batchUploadQueue[0].category).toBe('top')
      })

      it('should handle AI analysis failure gracefully', async () => {
        const files = [createMockFile('test1.jpg')]

        // Mock AI analysis failure
        vi.spyOn(api, 'analyzeClothing').mockResolvedValue({
          success: false,
          error: 'AI Error'
        })

        await useStore.getState().addBatchFiles(files)

        const state = useStore.getState()
        expect(state.batchUploadQueue).toHaveLength(1)
        expect(state.batchUploadQueue[0].aiStatus).toBe('failed')
        // Should still be in queue
      })

      it('should respect MAX_BATCH_SIZE', async () => {
        // Mock current queue to have 18 items
        useStore.setState({
          batchUploadQueue: Array(18).fill({ id: 'existing' } as any)
        })

        const files = [createMockFile('1.jpg'), createMockFile('2.jpg'), createMockFile('3.jpg')]

        await useStore.getState().addBatchFiles(files)

        // Should only add 2 more to reach 20 (MAX_BATCH_SIZE assumption from code)
        expect(useStore.getState().batchUploadQueue).toHaveLength(20)
      })

      it('should update progress during preprocessing', async () => {
        const files = [createMockFile('test1.jpg')]
        
        // Spy on setState to check intermediate states if possible, 
        // or just check final progress stats
        await useStore.getState().addBatchFiles(files)

        const state = useStore.getState()
        expect(state.batchUploadProgress.processedCount).toBe(1)
        expect(state.batchUploadProgress.successCount).toBe(1)
      })
    })

    describe('startBatchUpload()', () => {
      it('should upload queued files successfully', async () => {
        // Setup queue
        const queuedFile: QueuedFile = {
          id: 'q1',
          file: createMockFile('test.jpg'),
          originalName: 'test.jpg',
          preview: 'base64',
          category: 'top',
          aiStatus: 'success',
        }

        useStore.setState({
          batchUploadQueue: [queuedFile],
          batchUploadStatus: 'idle'
        })

        await useStore.getState().startBatchUpload()

        const state = useStore.getState()
        // Should be completed
        expect(state.batchUploadStatus).toBe('completed')
        // Item should be added to wardrobe
        expect(state.wardrobe).toHaveLength(1)
        expect(state.wardrobe[0].category).toBe('top')
      })

      it('should fail if category is missing', async () => {
        const queuedFile: QueuedFile = {
          id: 'q1',
          file: createMockFile('test.jpg'),
          originalName: 'test.jpg',
          preview: 'base64',
          // No category
          aiStatus: 'pending',
        }

        useStore.setState({
          batchUploadQueue: [queuedFile],
          batchUploadStatus: 'idle'
        })

        await useStore.getState().startBatchUpload()

        const state = useStore.getState()
        // Should handle error but finish process
        expect(state.wardrobe).toHaveLength(0)
        // Since we don't have granular error status per file in global status, 
        // we check if it finished.
        expect(state.batchUploadStatus).toBe('completed')
      })

      it('should handle cancellation', async () => {
        const queuedFile: QueuedFile = {
          id: 'q1',
          file: createMockFile('test.jpg'),
          originalName: 'test.jpg',
          preview: 'base64',
          category: 'top',
        }

        useStore.setState({
          batchUploadQueue: [queuedFile, { ...queuedFile, id: 'q2' }],
          batchUploadStatus: 'idle'
        })

        // Start upload but cancel immediately
        const uploadPromise = useStore.getState().startBatchUpload()
        useStore.getState().cancelBatchUpload()

        await uploadPromise

        const state = useStore.getState()
        expect(state.batchUploadStatus).toBe('cancelled')
        expect(state.shouldContinueBatchUpload).toBe(false)
      })
    })

    describe('Batch Queue Management', () => {
      it('should remove file from queue', () => {
        const file1: QueuedFile = { id: '1', originalName: '1.jpg' } as any
        const file2: QueuedFile = { id: '2', originalName: '2.jpg' } as any
        
        useStore.setState({ batchUploadQueue: [file1, file2] })

        useStore.getState().removeBatchFile('1')

        expect(useStore.getState().batchUploadQueue).toHaveLength(1)
        expect(useStore.getState().batchUploadQueue[0].id).toBe('2')
      })

      it('should update file category', () => {
        const file: QueuedFile = { id: '1', originalName: '1.jpg' } as any
        useStore.setState({ batchUploadQueue: [file] })

        useStore.getState().updateBatchFileCategory('1', 'shoes')

        expect(useStore.getState().batchUploadQueue[0].category).toBe('shoes')
      })

      it('should clear batch queue', () => {
        useStore.setState({ 
          batchUploadQueue: [{ id: '1' } as any],
          batchUploadStatus: 'completed' 
        })

        useStore.getState().clearBatchQueue()

        expect(useStore.getState().batchUploadQueue).toHaveLength(0)
        expect(useStore.getState().batchUploadStatus).toBe('idle')
      })
    })
  })
})
