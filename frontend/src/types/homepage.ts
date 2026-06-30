export type NewsItem = {
  id: string
  title: string
  summary: string
  href: string
  category: string
  categorySlug: string
  district?: string
  state?: string
  publishedAt: string
  imageLabel: string
  imageTone: 'red' | 'navy' | 'green' | 'amber' | 'slate'
  isBreaking?: boolean
  isFeatured?: boolean
}

export type CategoryBlock = {
  id: string
  title: string
  href: string
  items: NewsItem[]
}

export type DistrictBlock = {
  id: string
  name: string
  href: string
  items: NewsItem[]
}

export type VideoItem = {
  id: string
  title: string
  href: string
  youtubeVideoId: string
  duration: string
  imageLabel: string
}

export type GalleryItem = {
  id: string
  title: string
  href: string
  imageLabel: string
  imageTone: NewsItem['imageTone']
}
