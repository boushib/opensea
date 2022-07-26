import { Link } from 'react-router-dom'
import ETHIcon from '../../icons/ETH'
import { NFTItem } from '../../models'
import './NFTCard.sass'

interface Props {
  nft: NFTItem
}

const NFTCard = ({ nft }: Props) => (
  <Link to={`/assets/cryptopunks/${nft.tokenId}`} className="nft-card">
    <img src={nft.image} className="nft-card__image" alt="" />
    <div className="nft-card__footer">
      <div className="nft-card__id">#{nft.tokenId}</div>
      <div className="nft-card__sale">
        Last sale:
        <ETHIcon />
        <span>{nft.lastSale}</span>
      </div>
    </div>
  </Link>
)

export default NFTCard
