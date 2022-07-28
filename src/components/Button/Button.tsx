import classNames from 'classnames'
import './Button.sass'

interface Props {
  isPrimary?: boolean
  isSmall?: boolean
  children: React.ReactNode
  onClick?: () => void
}

const Button = ({ isPrimary, isSmall, children, onClick }: Props) => (
  <button
    className={classNames({
      btn: true,
      'btn--primary': isPrimary,
      'btn--small': isSmall,
    })}
    onClick={onClick}
  >
    {children}
  </button>
)

export default Button
