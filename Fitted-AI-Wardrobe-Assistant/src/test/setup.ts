import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { Canvas } from 'canvas'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock Canvas API using canvas package
global.HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, contextType: string) {
  if (contextType === '2d') {
    const canvas = new Canvas(this.width || 300, this.height || 150)
    return canvas.getContext('2d')
  }
  return null
} as any

global.HTMLCanvasElement.prototype.toBlob = function(callback: BlobCallback, type = 'image/png', _quality?: number) {
  // Create a mock blob from canvas
  setTimeout(() => {
    const blob = new Blob([new Uint8Array(100)], { type })
    callback(blob)
  }, 0)
} as any

// Mock Image constructor
global.Image = class MockImage {
  onload: (() => void) | null = null
  onerror: ((event: Event | string) => void) | null = null
  src: string = ''
  width: number = 0
  height: number = 0

  constructor() {
    // Simulate async image loading
    setTimeout(() => {
      this.width = 300
      this.height = 200
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
} as any

// Fix Worker mock - MUST be a constructor function, not arrow function
global.Worker = class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null

  constructor(public url: string | URL) {}

  postMessage = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  terminate = vi.fn()
  dispatchEvent = vi.fn()
} as any

// Mock FileReader
global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null
  error: DOMException | null = null
  readyState = 0
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  onprogress: ((event: ProgressEvent<FileReader>) => void) | null = null
  onabort: ((event: ProgressEvent<FileReader>) => void) | null = null

  readAsDataURL(_blob: Blob) {
    // Simulate async file reading
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' // Mock base64
      this.readyState = 2
      if (this.onload) {
        this.onload({ target: this } as any)
      }
    }, 0)
  }

  readAsArrayBuffer(_blob: Blob) {
    setTimeout(() => {
      this.result = new ArrayBuffer(8)
      this.readyState = 2
      if (this.onload) {
        this.onload({ target: this } as any)
      }
    }, 0)
  }

  abort() {}
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  dispatchEvent = vi.fn()
} as any

// Mock URL methods
const objectURLs = new Set<string>()
global.URL.createObjectURL = vi.fn((_blob: Blob | MediaSource) => {
  const url = `blob:mock-${Math.random().toString(36).substring(7)}`
  objectURLs.add(url)
  return url
})
global.URL.revokeObjectURL = vi.fn((url: string) => {
  objectURLs.delete(url)
})

// Mock IndexedDB (via idb library)
vi.mock('idb', () => ({
  openDB: vi.fn(() => Promise.resolve({
    transaction: vi.fn(() => ({
      objectStore: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve(undefined)),
        put: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve()),
        getAll: vi.fn(() => Promise.resolve([])),
      })),
    })),
    createObjectStore: vi.fn(),
    close: vi.fn(),
  })),
}))

// Mock external image processing libraries
vi.mock('@imgly/background-removal', () => ({
  removeBackground: vi.fn(async (_file: File) => {
    // Return mock blob (simulating background removal)
    return new Blob([new Uint8Array(100)], { type: 'image/png' })
  }),
}))

vi.mock('heic2any', () => ({
  default: vi.fn(async (_config: any) => {
    // Convert HEIC to JPEG mock
    return new Blob([new Uint8Array(100)], { type: 'image/jpeg' })
  }),
}))

vi.mock('browser-image-compression', () => ({
  default: vi.fn(async (file: File, _options: any) => {
    // Return smaller mock blob (simulating compression)
    return new Blob([new Uint8Array(50)], { type: file.type || 'image/jpeg' })
  }),
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
  // Clear object URLs
  objectURLs.clear()
})
