import Button from '../../components/Button'
import Property from '../../components/Property'
import { BORED_APE, LISTINGS, PROPERTIES } from '../../constants'
import ETHIcon from '../../icons/ETH'
import EyeIcon from '../../icons/Eye'
import HeartIcon from '../../icons/Heart'
import OfferIcon from '../../icons/Offer'
import TagsIcon from '../../icons/Tags'
import TimeIcon from '../../icons/Time'
import './Asset.sass'

const asset = BORED_APE[0]
const ETH_TO_USD = 1549.95

const Asset = () => (
  <div className="asset">
    <div className="container">
      <div className="asset__grid">
        <div className="asset__grid__item">
          <img src={asset.image} className="asset__image" alt="" />
          <div className="card">
            <div className="card__header">
              <TagsIcon />
              Properties
            </div>
            <div className="card__body">
              <div className="asset__properties">
                {PROPERTIES.map(({ id, type, value, description }) => (
                  <Property
                    key={id}
                    type={type}
                    value={value}
                    description={description}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="asset__grid__item asset__grid__item--expanded">
          <h2>#{asset.tokenId}</h2>
          <div className="asset__meta">
            <div className="asset__meta__item">
              Owned by <a href="https://opensea.io/ImCap">ImCap</a>
            </div>
            <div className="asset__meta__item">
              <EyeIcon /> 8.3K views
            </div>
            <div className="asset__meta__item">
              <HeartIcon /> 52 favorites
            </div>
          </div>
          <div className="card">
            <div className="card__header">
              <TimeIcon />
              Sale ends August 25, 2022 at 11:08am GMT+1
            </div>
            <div className="card__body">
              <div>
                <div className="label">Current price</div>
                <div className="asset__price">
                  <ETHIcon />
                  <span>85.986</span>
                  ($128,009.94)
                </div>
              </div>
              <div className="btn__group">
                <Button isPrimary>Buy now</Button>
                <Button>Make offer</Button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card__header">
              <OfferIcon />
              Listings
            </div>
            <div className="card__body">
              <table className="table">
                <thead>
                  <tr>
                    <th>Price</th>
                    <th>USD Price</th>
                    <th>Expiration</th>
                    <th>From</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {LISTINGS.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="price">
                          <ETHIcon />
                          {a.price}
                        </div>
                      </td>
                      <td>${(a.price * ETH_TO_USD).toFixed(2)}</td>
                      <td>{a.expiration}</td>
                      <td>{a.from}</td>
                      <td>
                        <Button isSmall>Buy</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default Asset
