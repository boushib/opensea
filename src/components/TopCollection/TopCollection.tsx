import classNames from 'classnames'
import { Link } from 'react-router-dom'
import ETHIcon from '../../icons/ETH'
import VerifiedIcon from '../../icons/Verified'
import { Collection } from '../../models'
import { formatToK } from '../../utils'
import './TopCollection.sass'

interface Props {
  rank: number
  collection: Collection
}

const TopCollection = ({ rank, collection }: Props) => (
  <Link to={`/collections/${collection.slug}`} className="top-collection">
    <div className="top-collection__rank">{rank}</div>
    <div className="top-collection__avatar__container">
      <img className="top-collection__avatar" src={collection.avatar} alt="" />
      {collection.isVerified && <VerifiedIcon />}
    </div>
    <div>
      <div className="top-collection__name">Bored Ape Yacht Club</div>
      <div className="top-collection__price">
        Floor price:
        <ETHIcon />
        <span>
          {collection.floorPrice ? collection.floorPrice.toFixed(2) : '-'}
        </span>
      </div>
    </div>
    <div>
      <div
        className={classNames({
          'top-collection__change': true,
          'top-collection__change--success': collection.volumeChange >= 0,
          'top-collection__change--danger': collection.volumeChange < 0,
        })}
      >
        {collection.volumeChange >= 0 && '+'}
        {formatToK(100 * collection.volumeChange)}%
      </div>
      <div className="top-collection__price">
        <ETHIcon />
        <span>{formatToK(collection.volume)}</span>
      </div>
    </div>
  </Link>
)

export default TopCollection
