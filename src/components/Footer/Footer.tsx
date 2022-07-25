import { Link } from 'react-router-dom'
import Logo from '../../assets/img/logo-white.svg'
import './Footer.sass'

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer__grid">
        <div className="footer__about">
          <img src={Logo} className="footer__logo" alt="logo" />
          <p>
            The world’s first and largest digital marketplace for crypto
            collectibles and non-fungible tokens (NFTs). Buy, sell, and discover
            exclusive digital items.
          </p>
        </div>
        <div className="footer__section">
          <div className="footer__section__heading">Marketplace</div>
          <Link to="" className="footer__section__link">
            All NFTs
          </Link>
          <Link to="" className="footer__section__link">
            Solana NFTs
          </Link>
          <Link to="" className="footer__section__link">
            Art
          </Link>
          <Link to="" className="footer__section__link">
            Collectibles
          </Link>
          <Link to="" className="footer__section__link">
            Domain Names
          </Link>
          <Link to="" className="footer__section__link">
            Music
          </Link>
          <Link to="" className="footer__section__link">
            Photography
          </Link>
          <Link to="" className="footer__section__link">
            Sports
          </Link>
          <Link to="" className="footer__section__link">
            Trading Cards
          </Link>
          <Link to="" className="footer__section__link">
            Utility
          </Link>
          <Link to="" className="footer__section__link">
            Virtual Worlds
          </Link>
        </div>
        <div className="footer__section">
          <div className="footer__section__heading">Account</div>
          <Link to="" className="footer__section__link">
            Profile
          </Link>
          <Link to="" className="footer__section__link">
            Favorites
          </Link>
          <Link to="" className="footer__section__link">
            Watchlist
          </Link>
          <Link to="" className="footer__section__link">
            My Collections
          </Link>
          <Link to="" className="footer__section__link">
            Settings
          </Link>
          <Link to="" className="footer__section__link">
            Rankings
          </Link>
          <Link to="" className="footer__section__link">
            Activity
          </Link>
        </div>
        <div className="footer__section">
          <div className="footer__section__heading">Resources</div>
          <Link to="" className="footer__section__link">
            Help Center
          </Link>
          <Link to="" className="footer__section__link">
            Platform Status
          </Link>
          <Link to="" className="footer__section__link">
            Partners
          </Link>
          <Link to="" className="footer__section__link">
            Gas-Free Marketplace
          </Link>
          <Link to="" className="footer__section__link">
            Taxes
          </Link>
          <Link to="" className="footer__section__link">
            Blog
          </Link>
          <Link to="" className="footer__section__link">
            Docs
          </Link>
          <Link to="" className="footer__section__link">
            Newsletter
          </Link>
        </div>
        <div className="footer__section">
          <div className="footer__section__heading">Company</div>
          <Link to="" className="footer__section__link">
            About
          </Link>
          <Link to="" className="footer__section__link">
            Careers
          </Link>
          <Link to="" className="footer__section__link">
            Ventures
          </Link>
          <Link to="" className="footer__section__link">
            Grants
          </Link>
        </div>
      </div>
      <hr />
      <div className="footer__copy">
        &copy; 2018 - {new Date().getFullYear()} Ozone Networks, Inc
        <div className="footer__copy__menu">
          <Link to="/privacy-policy">Privacy policy</Link>
          <Link to="/terms-of-use">Terms of use</Link>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
