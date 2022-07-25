import { Link } from 'react-router-dom'
import Button from '../Button'
import './Hero.sass'

const Hero = () => (
  <div className="hero">
    <div className="container">
      <div className="hero__grid">
        <div className="hero__grid__item">
          <h1 className="hero__heading">
            Discover, collect, and sell extraordinary NFTs
          </h1>
          <p className="hero__subheading">
            OpenSea is the world's first and largest NFT marketplace
          </p>
          <div className="btn__group">
            <Button isPrimary>Explore</Button>
            <Button>Create</Button>
          </div>
          <Link to="/" className="hero__meta">
            Learn more about OpenSea
          </Link>
        </div>
        <div className="hero__grid__item">
          <div className="hero__card">
            <img
              className="hero__card__image"
              src="https://openseauserdata.com/files/zoonies_featured_image_4Z8jsfR.jpg"
              alt=""
            />
            <div className="hero__card__footer">
              <img
                className="hero__card__avatar"
                src="https://lh3.googleusercontent.com/rycHW_oVgsLQelfu7KJKgMu9RpPm2tX17b8PaEXmMQUQvnRDq8J63iDhsfFjM3f3qI7ZBmM0UOrIBk2xF_EcKVLYm_YB--15yO4cpg=s76"
                alt=""
              ></img>
              Zoonies
              <Button isPrimary isSmall>
                Mint now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default Hero
