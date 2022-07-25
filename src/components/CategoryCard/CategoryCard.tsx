import { Link } from 'react-router-dom'
import { Category } from '../../models'
import './CategoryCard.sass'

interface Props {
  category: Category
}

const CategoryCard = ({ category }: Props) => (
  <Link
    to={`/categories/${category.slug}`}
    target="_blank"
    className="category-card"
  >
    <img src={category.image} alt="" className="category-card__image" />
    <div className="category-card__footer">
      <div className="category-card__name">{category.name}</div>
    </div>
  </Link>
)

export default CategoryCard
