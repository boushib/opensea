import SearchIcon from '../../icons/Search'
import './SearchBox.sass'

const SearchBox = () => (
  <div className="search-box">
    <SearchIcon />
    <input
      type="text"
      placeholder="Search items, collections, and accounts"
      aria-label="Search items, collections, and accounts"
      aria-multiline={false}
    />
  </div>
)

export default SearchBox
