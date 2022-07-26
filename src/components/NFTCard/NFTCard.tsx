import { Link } from 'react-router-dom'
import ETHIcon from '../../icons/ETH'
import './NFTCard.sass'

interface Props {
  tokenId: number
  image: string
  lastSale: number
}

const NFTCard = ({ tokenId, image, lastSale }: Props) => (
  <Link to={`/assets/cryptopunks/${tokenId}`} className="nft-card">
    <img src={image} className="nft-card__image" alt="" />
    <div className="nft-card__footer">
      <div className="nft-card__id">#{tokenId}</div>
      <div className="nft-card__sale">
        Last sale:
        <ETHIcon />
        <span>{lastSale}</span>
      </div>
    </div>
  </Link>
)

export default NFTCard
