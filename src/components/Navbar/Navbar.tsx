import { Link } from 'react-router-dom'
import Logo from '../../assets/img/logo.svg'
import ProfileIcon from '../../icons/Profile'
import WalletIcon from '../../icons/Wallet'
import SearchBox from '../SearchBox'
import './Navbar.sass'

const Navbar = () => (
  <nav className="nav">
    <NavLogo />
    <SearchBox />
    <NavMenu />
    <NavTail />
  </nav>
)

const NavLogo = () => (
  <Link to="/">
    <img src={Logo} alt="logo" className="nav__logo" />
  </Link>
)

const NavMenu = () => (
  <div className="nav__menu">
    <Link to="/explore" className="nav__menu__item">
      Explore
    </Link>
    <Link to="/stats" className="nav__menu__item">
      Stats
    </Link>
    <Link to="/resources" className="nav__menu__item">
      Resources
    </Link>
    <Link to="/create" className="nav__menu__item">
      Create
    </Link>
  </div>
)

const NavTail = () => (
  <div className="nav__tail">
    <ProfileIcon />
    <WalletIcon />
  </div>
)

export default Navbar
