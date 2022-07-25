import Categories from '../../components/Categories'
import Hero from '../../components/Hero'
import TopCollectors from '../../components/TopCollectors'
import './Home.sass'

const Home = () => (
  <div className="home">
    <Hero />
    <TopCollectors />
    <Categories />
  </div>
)

export default Home
