export interface Collection {
  id: string
  slug: string
  name: string
  avatar: string
  isVerified: boolean
  floorPrice?: number
  volume: number
  volumeChange: number
}

export interface Category {
  id: string
  slug: string
  name: string
  image: string
}
