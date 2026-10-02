import { hash, mulberry32 } from './rng'

export type User = { id: string; name: string; address: `0x${string}`; verified: boolean }

const NAMES = [
  'pixelpilgrim', 'moonmarket', 'satoshi_snacks', 'gwei_gardener', 'NoahFields', 'hodl.haley', 'mintmachine', 'cryptoclara', 'blockbard',
  'DegenDaisy', 'ape_in_amy', 'floorsweeper', 'tokentom', 'lunalabs', 'zk_zoe', 'rarityhunter', 'diamondpaws', 'basedben', 'ethelwynn',
  'nftnadia', 'gas_guzzler', 'vaultvera', 'orbitowl', 'kai.eth', 'ser_sam', 'wenlambo', 'ledgerlou', 'mira_mints', 'quietcollector', 'jpeg_jules',
] as const

const toAddress = (seed: string) => {
  const rng = mulberry32(hash(seed))
  let hex = ''
  while (hex.length < 40) hex += Math.floor(rng() * 16).toString(16)
  return `0x${hex}` as const
}

export const USERS: User[] = NAMES.map((name, i) => ({
  id: `u${i + 1}`,
  name,
  address: toAddress(`user:${name}`),
  verified: i % 7 === 0,
}))

/** Creators of the demo collections */
export const CREATORS: Record<string, User> = Object.fromEntries(
  [
    ['pixel-studio', 'PixelStudio'],
    ['moonfolk-labs', 'Moonfolk Labs'],
    ['ada-ruiz', 'Ada Ruiz'],
    ['halley-works', 'Halley Works'],
    ['terraforma', 'Terraforma'],
    ['wavelength', 'Wavelength Records'],
    ['glyphforge', 'Glyphforge'],
  ].map(([id, name]) => [id, { id, name, address: toAddress(`creator:${id}`), verified: true }])
)

export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`
