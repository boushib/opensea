import { drawItem, getCollections } from '@/lib/catalog'

// Every catalog item's art is drawn once at build time and saved as /art/<collection>/<token>.svg
export const dynamicParams = false
export const generateStaticParams = () => getCollections().flatMap((c) => c.items.map((i) => ({ slug: c.slug, file: `${i.tokenId}.svg` })))

/** An item's art as an SVG image */
export async function GET(_req: Request, ctx: RouteContext<'/art/[slug]/[file]'>) {
  const { slug, file } = await ctx.params
  const art = drawItem(slug, Number(file.replace(/\.svg$/, '')))
  if (!art) return new Response('Not found', { status: 404 })
  return new Response(art, { headers: { 'Content-Type': 'image/svg+xml' } })
}
