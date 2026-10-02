// Small enough to use in client components without pulling in the catalog
export const artUrl = (slug: string, tokenId: number) => `/art/${slug}/${tokenId}`

export const itemUrl = (slug: string, tokenId: number) => `/item/${slug}/${tokenId}`

export const collectionUrl = (slug: string) => `/collection/${slug}`

export const userUrl = (address: string) => `/user/${address.toLowerCase()}`
