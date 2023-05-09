import ModalContext from '../contexts/ModalContext'
import './Container.css'
import Payment from './Payment'

export default function Container({children}) {
  return (
  <ModalContext>
      <Payment/>
      <div className="Container">{children}</div>
  </ModalContext>
  )
}
