import Categories from '../../components/Categories'
import Hero from '../../components/Hero'
import TopCollections from '../../components/TopCollections'
import './Home.sass'

const Home = () => (
  <div className="home">
    <Hero />
    <TopCollections />
    <Categories />
  </div>
)

export default Home
