import { Link } from 'react-router-dom'
import Logo from '../../assets/img/logo.svg'
import ProfileIcon from '../../icons/Profile'
import WalletIcon from '../../icons/Wallet'
import Button from '../Button'
import SearchBox from '../SearchBox'
import './Navbar.sass'

interface Props {
  address?: string
  onConnectWallet: () => void
}

const Navbar = ({ address, onConnectWallet }: Props) => (
  <nav className="nav">
    <NavLogo />
    <SearchBox />
    <NavMenu />
    <NavTail address={address} onConnectWallet={onConnectWallet} />
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

const NavTail = ({ address, onConnectWallet }: Props) => (
  <div className="nav__tail">
    {address && (
      <>
        <ProfileIcon />
        <WalletIcon />
      </>
    )}
    {!address && (
      <Button isPrimary isSmall onClick={onConnectWallet}>
        Connect wallet
      </Button>
    )}
  </div>
)

export default Navbar
