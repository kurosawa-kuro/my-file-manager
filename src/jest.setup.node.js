import '@testing-library/jest-dom'

// Mock environment variables for Node.js tests
process.env.VIDEO_DIR = 'C:\\test\\videos'

// Mock fetch for Node.js environment
global.fetch = jest.fn()