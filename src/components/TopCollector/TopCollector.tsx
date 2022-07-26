import classNames from 'classnames'
import ETHIcon from '../../icons/ETH'
import VerifiedIcon from '../../icons/Verified'
import { Collector } from '../../models'
import { formatToK } from '../../utils'
import './TopCollector.sass'

interface Props {
  rank: number
  collector: Collector
}

const TopCollector = ({ rank, collector }: Props) => (
  <div className="top-collector">
    <div className="top-collector__rank">{rank}</div>
    <div className="top-collector__avatar__container">
      <img className="top-collector__avatar" src={collector.avatar} alt="" />
      {collector.isVerified && <VerifiedIcon />}
    </div>
    <div>
      <div className="top-collector__name">Bored Ape Yacht Club</div>
      <div className="top-collector__price">
        Floor price:
        <ETHIcon />
        <span>
          {collector.floorPrice ? collector.floorPrice.toFixed(2) : '-'}
        </span>
      </div>
    </div>
    <div>
      <div
        className={classNames({
          'top-collector__change': true,
          'top-collector__change--success': collector.volumeChange >= 0,
          'top-collector__change--danger': collector.volumeChange < 0,
        })}
      >
        {collector.volumeChange >= 0 && '+'}
        {formatToK(100 * collector.volumeChange)}%
      </div>
      <div className="top-collector__price">
        <ETHIcon />
        <span>{formatToK(collector.volume)}</span>
      </div>
    </div>
  </div>
)

export default TopCollector
