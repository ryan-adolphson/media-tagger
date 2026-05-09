import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import HttpService from './http-service'
import { SearchResponse } from '../types'

describe('HttpService', () => {
  let http: HttpService
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
    http = new HttpService('http://api.test', { 'X-API-Key': 'test-key' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const respondOk = (data: unknown) =>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => data,
    } as Response)

  const respondError = (status: number, body = '') =>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status,
      statusText: 'Error',
      text: async () => body,
    } as Response)

  describe('post', () => {
    it('sends JSON body with Content-Type header for plain objects', async () => {
      respondOk({})
      await http.post('/search', { text: 'hello', keywords: ['world'] })

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toBe('http://api.test/search')
      expect(options.method).toBe('POST')
      expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
      expect(options.body).toBe(JSON.stringify({ text: 'hello', keywords: ['world'] }))
    })

    it('omits Content-Type for FormData so browser sets the boundary', async () => {
      respondOk({})
      const formData = new FormData()
      await http.post('/image', formData)

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((options.headers as Record<string, string>)['Content-Type']).toBeUndefined()
      expect(options.body).toBe(formData)
    })

    it('includes default headers in every request', async () => {
      respondOk({})
      await http.post('/search', { text: 'hi', keywords: [] })

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((options.headers as Record<string, string>)['X-API-Key']).toBe('test-key')
    })

    it('returns parsed JSON on success', async () => {
      const data: SearchResponse = { found: ['ryan'], keyword_count: 1, match_count: 1, not_found: [] }
      respondOk(data)

      const result = await http.post<SearchResponse>('/search', { text: 'hi', keywords: ['ryan'] })
      expect(result).toEqual(data)
    })

    it('throws with status code when server returns non-ok response', async () => {
      respondError(422, 'Validation failed')
      await expect(http.post('/search', { text: 'hi', keywords: [] })).rejects.toThrow('422')
    })

    it('throws with statusText when response body is empty', async () => {
      respondError(500, '')
      await expect(http.post('/search', { text: 'hi', keywords: [] })).rejects.toThrow('500')
    })
  })

  describe('postImage', () => {
    it('posts to /image route', async () => {
      respondOk({})
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
      await http.postImage(file)

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toBe('http://api.test/image')
    })

    it('sends the file inside FormData under the "file" key', async () => {
      respondOk({})
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
      await http.postImage(file)

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((options.body as FormData).get('file')).toBe(file)
    })
  })

  describe('postVideo', () => {
    it('posts to /video route', async () => {
      respondOk({})
      const file = new File(['data'], 'clip.mp4', { type: 'video/mp4' })
      await http.postVideo(file)

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toBe('http://api.test/video')
    })

    it('sends the file inside FormData under the "file" key', async () => {
      respondOk({})
      const file = new File(['data'], 'clip.mp4', { type: 'video/mp4' })
      await http.postVideo(file)

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((options.body as FormData).get('file')).toBe(file)
    })
  })
})
