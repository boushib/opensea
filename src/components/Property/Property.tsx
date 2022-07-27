import './Property.sass'

interface Props {
  type: string
  value: string
  description: string
}

const Property = ({ type, value, description }: Props) => (
  <div className="property">
    <div className="property__type">{type}</div>
    <div className="property__value">{value}</div>
    <div className="property__description">{description}</div>
  </div>
)

export default Property
