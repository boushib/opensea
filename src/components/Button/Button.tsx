import classNames from 'classnames'
import './Button.sass'

interface Props {
  isPrimary?: boolean
  isSmall?: boolean
  children: React.ReactNode
}

const Button = ({ isPrimary, isSmall, children }: Props) => (
  <button
    className={classNames({
      btn: true,
      'btn--primary': isPrimary,
      'btn--small': isSmall,
    })}
  >
    {children}
  </button>
)

export default Button
