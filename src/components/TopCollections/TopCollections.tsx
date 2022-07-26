import { TOP_COLLECTIONS } from '../../constants'
import TopCollection from '../TopCollection/TopCollection'
import './TopCollectionss.sass'

const TopCollections = () => (
  <div className="top-collections">
    <div className="container">
      <h2 className="top-collections__heading">
        Top collections over <span>last 24 hours</span>
      </h2>
      <div className="top-collections__grid">
        {TOP_COLLECTIONS.map((c, idx) => (
          <TopCollection rank={idx + 1} collection={c} key={c.id} />
        ))}
      </div>
    </div>
  </div>
)

export default TopCollections
