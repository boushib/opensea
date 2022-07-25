export interface Collector {
  id: string
  slug: string
  name: string
  avatar: string
  isVerified: boolean
  floorPrice?: number
  volume: number
  volumeChange: number
}
