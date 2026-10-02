# Roadmap: an on-chain version

Today the marketplace runs without a blockchain backend. This document records what's real now, what isn't, and how to make trading real on a test network later.

## Where it stands

| Part | Today |
| --- | --- |
| Wallet connection | Real: MetaMask, Rabby or any browser wallet on Sepolia |
| Balance | Real: read from a public Sepolia node |
| Signatures | Real: buying and offers ask the wallet to sign a message |
| NFTs and collections | Generated in the app from fixed seeds (`lib/catalog.ts`); no contract exists |
| Buying, selling, offers | Signed messages only: no ETH moves and no token changes hands |
| Your activity | Saved in your browser (`lib/market.ts`); nobody else sees it, and nothing verifies the signatures |

## What an on-chain version needs

### 1. NFT contracts

- An ERC-721 contract per collection (or one ERC-721 with collection IDs), deployed on **Sepolia**.
- Mint the demo collections to a set of holder wallets, so ownership lives on the chain.
- Token metadata (`tokenURI`) can keep using the generated art: either the `/art/<collection>/<token>` route, or the SVG embedded as a data URL so it works without the site.
- Tooling: Foundry or Hardhat for the contracts and deploy scripts; verify them on Etherscan.

### 2. A marketplace contract

Two options:

- **Seaport** (OpenSea's own open-source protocol, already deployed on Sepolia). Listings and offers are signed EIP-712 orders kept off-chain; a purchase is a single `fulfillOrder` transaction. No contract of our own to audit, and it matches how OpenSea really works.
- **A small custom contract** (`list`, `buy`, `makeOffer`, `acceptOffer`, `cancel`) holding listings and escrowed offers on-chain. Simpler to read, but more gas and our own code to secure.

Seaport is the better fit: it's what the real site uses, and its orders map directly onto the listings and offers the app already shows.

### 3. A backend

The chain can't answer "what's listed in this collection under 1 ETH" quickly, and Seaport orders live off-chain, so a small backend is needed:

- **Order book:** stores signed listings and offers (Seaport orders), checks each signature and that the signer still owns the item, and serves them to every visitor. This is what lets other people see your listings and offers.
- **Indexer:** follows the contracts' `Transfer` and Seaport `OrderFulfilled` events (with viem `watchContractEvent`, or a hosted indexer such as Ponder, The Graph or Alchemy webhooks) and keeps owners, sales and activity in a database.
- **Stats:** floor price, volume, owners and the price history charts are computed from indexed sales instead of the seeded data.
- **Storage:** Postgres works well; the existing pages only need their data source swapped.
- **Notifications:** sold, outbid and offer-accepted events come from the indexer, delivered over Server-Sent Events or WebSockets.

### 4. App changes

- Replace "sign a message" with real transactions: Seaport `fulfillOrder` to buy, approval plus a signed order to list, and so on (wagmi `useWriteContract`, `useWaitForTransactionReceipt`).
- Show pending and confirmed transaction states, with Etherscan links.
- Read listings, offers, owners and activity from the backend; keep the generated catalog as seed data for the first mint.
- Keep the **demo mode** as the default: Sepolia ETH is hard to get (faucets give small amounts, often only to wallets with mainnet history), so most visitors couldn't try on-chain trading. Offer "On-chain mode" for wallets that have test ETH.

## Rough order

1. ERC-721 contract, deploy script and a mint of one collection on Sepolia
2. Seaport listings and purchases for that collection, behind an "On-chain mode" switch
3. Backend: order book and indexer, then stats and activity from indexed data
4. Offers, collection offers and auctions through Seaport
5. Notifications from indexed events

## Out of scope for now

Mainnet, real money, royalties enforcement, and moderation of user-created collections.
