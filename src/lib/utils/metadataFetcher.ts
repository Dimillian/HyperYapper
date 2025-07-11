export interface LinkMetadata {
  url: string
  title: string
  description: string
  image?: string
  siteName?: string
}

export class MetadataFetcher {
  private static async fetchWithTimeout(url: string, timeout: number = 5000): Promise<Response> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'HyperYapper/1.0 (Social Media Client)',
        },
      })
      clearTimeout(id)
      return response
    } catch (error) {
      clearTimeout(id)
      throw error
    }
  }

  static async fetchMetadata(url: string): Promise<LinkMetadata | null> {
    try {
      // Validate URL
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null
      }

      const response = await this.fetchWithTimeout(url)
      
      if (!response.ok) {
        return null
      }

      const html = await response.text()
      
      // Parse HTML to extract metadata
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      // Extract metadata with fallbacks
      const title = this.extractTitle(doc)
      const description = this.extractDescription(doc)
      const image = this.extractImage(doc, url)
      const siteName = this.extractSiteName(doc)

      return {
        url,
        title,
        description,
        image,
        siteName,
      }
    } catch (error) {
      console.error('Error fetching metadata for URL:', url, error)
      return null
    }
  }

  private static extractTitle(doc: Document): string {
    // Try Open Graph title first
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
    if (ogTitle) return ogTitle

    // Try Twitter title
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
    if (twitterTitle) return twitterTitle

    // Fall back to HTML title
    const htmlTitle = doc.querySelector('title')?.textContent
    if (htmlTitle) return htmlTitle

    return 'Untitled'
  }

  private static extractDescription(doc: Document): string {
    // Try Open Graph description first
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
    if (ogDescription) return ogDescription

    // Try Twitter description
    const twitterDescription = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content')
    if (twitterDescription) return twitterDescription

    // Fall back to meta description
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content')
    if (metaDescription) return metaDescription

    return ''
  }

  private static extractImage(doc: Document, baseUrl: string): string | undefined {
    // Try Open Graph image first
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
    if (ogImage) return this.resolveUrl(ogImage, baseUrl)

    // Try Twitter image
    const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
    if (twitterImage) return this.resolveUrl(twitterImage, baseUrl)

    // Try favicon as fallback
    const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                   doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href')
    if (favicon) return this.resolveUrl(favicon, baseUrl)

    return undefined
  }

  private static extractSiteName(doc: Document): string | undefined {
    // Try Open Graph site name
    const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content')
    if (ogSiteName) return ogSiteName

    // Try Twitter site
    const twitterSite = doc.querySelector('meta[name="twitter:site"]')?.getAttribute('content')
    if (twitterSite) return twitterSite

    return undefined
  }

  private static resolveUrl(url: string, baseUrl: string): string {
    try {
      return new URL(url, baseUrl).href
    } catch {
      return url
    }
  }

  static extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi
    return text.match(urlRegex) || []
  }
}