import { CATEGORIES } from '../../constants'
import CategoryCard from '../CategoryCard'
import './Categories.sass'

const Categories = () => (
  <div className="categories">
    <div className="container">
      <h2 className="categories__heading">
        Browse by <span>category</span>
      </h2>
      <div className="categories__grid">
        {CATEGORIES.map((c) => (
          <CategoryCard category={c} key={c.id} />
        ))}
      </div>
    </div>
  </div>
)

export default Categories
