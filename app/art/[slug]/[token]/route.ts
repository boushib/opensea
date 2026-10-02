import { drawItem } from '@/lib/catalog'

/** An item's art as an SVG image; it never changes, so browsers can keep it forever */
export async function GET(_req: Request, ctx: RouteContext<'/art/[slug]/[token]'>) {
  const { slug, token } = await ctx.params
  const art = drawItem(slug, Number(token))
  if (!art) return new Response('Not found', { status: 404 })
  return new Response(art, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
