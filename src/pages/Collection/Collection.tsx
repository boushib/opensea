import { TOP_COLLECTIONS } from '../../constants'
import ETHIcon from '../../icons/ETH'
import VerifiedIcon from '../../icons/Verified'
import './Collection.sass'

const collection = TOP_COLLECTIONS[0]

const Collection = () => (
  <div className="collection">
    <div className="collection__banner">
      <div className="collection__banner__image__wrapper">
        <div
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1456428746267-a1756408f782?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80")',
          }}
          className="collection__banner__image"
        />
      </div>
      <img
        src={collection.avatar}
        className="collection__avatar"
        alt={collection.name}
      />
    </div>
    <div className="container">
      <h2 className="collection__name">
        {collection.name}
        {collection.isVerified && <VerifiedIcon />}
      </h2>
      <p className="collection__description">
        The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape
        NFTs— unique digital collectibles living on the Ethereum blockchain.
        Your Bored Ape doubles as your Yacht Club membership card, and grants
        access to members-only benefits, the first of which is access to THE
        BATHROOM, a collaborative graffiti board. Future areas and perks can be
        unlocked by the community through roadmap activation.
      </p>
      <div className="collection__stats">
        <div className="collection__stats__item">
          <div className="collection__stats__item__label">10.0K</div>
          <div className="collection__stats__item__value">Items</div>
        </div>
        <div className="collection__stats__item">
          <div className="collection__stats__item__label">6.5k</div>
          <div className="collection__stats__item__value">Owners</div>
        </div>
        <div className="collection__stats__item">
          <div className="collection__stats__item__label">
            <ETHIcon />
            641.5K
          </div>
          <div className="collection__stats__item__value">Total volume</div>
        </div>
        <div className="collection__stats__item">
          <div className="collection__stats__item__label">
            <ETHIcon />
            86.82
          </div>
          <div className="collection__stats__item__value">Floor price</div>
        </div>
        <div className="collection__stats__item">
          <div className="collection__stats__item__label">
            <ETHIcon />
            81
          </div>
          <div className="collection__stats__item__value">Best offer</div>
        </div>
      </div>
    </div>
  </div>
)

export default Collection
