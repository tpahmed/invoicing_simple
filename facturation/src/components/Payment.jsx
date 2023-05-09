import { useState, useContext } from "react"
import { Modal_Context } from "../contexts/ModalContext";

import './Payment.css'
import axios from "axios";

export default function Payment() {
  const [Amount,setAmount] = useState('');
  const {No_inv,setNo_inv} = useContext(Modal_Context);
  const Pay = ()=>{
    axios.post(`//localhost:4444/facture/${No_inv}`,{Amount}).then(()=>{
      setNo_inv('')
    })
  }
  return (
    <div className="Payment" style={!No_inv ? {zIndex:'-10',visibility:"hidden",backgroundColor:'rgba(0,0,0,0)'} : null}>
        <div className="Payment-Modal">
            <h3>Payment for {No_inv}</h3>
            <input type="text" placeholder="Amount" value={Amount} onChange={(e)=>!isNaN(Number(e.target.value)) ? setAmount(e.target.value) : '' }/>
            <button onClick={Pay}>Pay</button>
            <button onClick={()=>setNo_inv('')}>Cancel</button>
        </div>
    </div>
  )
}
