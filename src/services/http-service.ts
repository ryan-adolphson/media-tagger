export default class HttpService {
  private readonly baseUrl: string
  private readonly defaultHeaders: Record<string, string>

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl
    this.defaultHeaders = defaultHeaders
  }

  async post<T>(path: string, body: Record<string, unknown> | FormData): Promise<T> {
    const isFormData = body instanceof FormData
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Server responded with ${res.status}: ${text || res.statusText}`)
    }

    return res.json() as Promise<T>
  }

  async postImage<T>(file: File): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    return this.post<T>('/image', formData)
  }

  async postVideo<T>(file: File): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    return this.post<T>('/video', formData)
  }
}
