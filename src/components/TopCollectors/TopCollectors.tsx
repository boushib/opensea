import { TOP_COLLECTORS } from '../../constants'
import TopCollector from '../TopCollector/TopCollector'
import './TopCollectors.sass'

const TopCollectors = () => (
  <div className="top-collectors">
    <div className="container">
      <h2 className="top-collectors__heading">
        Top collections over <span>last 24 hours</span>
      </h2>
      <div className="top-collectors__grid">
        {TOP_COLLECTORS.map((c, idx) => (
          <TopCollector rank={idx + 1} collector={c} key={c.id} />
        ))}
      </div>
    </div>
  </div>
)

export default TopCollectors
