import Reflechir from '../assets/Reflechir.svg'
import { useEffect, useState, useContext } from 'react';
import Yes from '../assets/Yes.svg'
import No from '../assets/No.svg'
import Bin from '../assets/Bin.svg'
import Info from '../assets/Info.svg'
import Pen from '../assets/Pen.svg'
import './Gere.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal_Context } from "../contexts/ModalContext";

export default function GereFacture() {
    const [search,setSearch] = useState('');
    const [Factures,setFactures] = useState([]);
    const {No_inv,setNo_inv} = useContext(Modal_Context);
    const Navigator = useNavigate();
    const Supprimer = (id)=>{
        axios.delete(`//localhost:4444/facture/${id}`).then((e)=>{
            Update();
        });
    };

  async function Update(){
    const response = await axios.get('//localhost:4444/facture');
    setFactures(response.data.data);
  }
  useEffect(()=>{
    Update()
  },[No_inv]);
  return (
    <div className="GereFacture">
          <div className="GereFacture-Options">
              <div>
                  <input type='text' placeholder='Search for Invoice' value={search} onChange={(e)=>setSearch(e.target.value)}/>
                  <img src={Reflechir} alt='Update' onClick={Update} />
              </div>
              <div>
                  <button className="GereFacture-Button" onClick={()=>Navigator('/facture/ajouter')}>
                      Create Invoice
                  </button>
              </div>
          </div>
          <div className="GereFacture-List">
            <table className="GereFacture-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Total</th>
                  <th>Payed</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
              
                  {
                    Factures.filter((e)=>{
                      for (let elem in e){
                        if(`${e[elem]}`.toUpperCase().includes(search.toUpperCase())){
                          return e;
                        }
                      }
                    }).map((e)=>(
                      <tr key={e.no_inv}>
                        <td>{e.no_inv}</td>
                        <td>{new Date(Date.parse(e.Date_inv)).toLocaleDateString('en-GB').replace(/\//gi,'.')}</td>
                        <td>{e.Note}</td>
                        <td>${e.Total*(100+e.Taxes)/100}</td>
                        <td style={(e.Total*(100+e.Taxes)/100 - e.Payed) <= 0 ? null : { cursor:"pointer" }} onClick={(e.Total*(100+e.Taxes)/100 - e.Payed) <= 0 ? null : ()=>setNo_inv(e.no_inv) }>
                          <img src={(e.Total*(100+e.Taxes)/100 - e.Payed) <= 0 ? Yes : e.Payed == 0 ? No : ''} alt={(e.Total*(100+e.Taxes)/100 - e.Payed) <= 0 ? 'Yes' : e.Payed == 0 ?'No' : ''} className={(e.Total*(100+e.Taxes)/100 - e.Payed) <= 0 ? "GereFacture-Payed-100" : e.Payed == 0 ? "GereFacture-Payed-0" : "GereFacture-Payed-Part"} width={'40px'} />
                          <b style={e.Payed > 0 && e.Payed < (e.Total*(100+e.Taxes)/100) ? null :{ "display":'none' }}>${e.Payed}</b>
                        </td>
                        <td>
                          <button onClick={()=>Navigator(`/facture/view/${e.no_inv}`)}><img src={Info} alt={`Inspect ${e.no_inv}`} width={'40px'} /></button>
                          <button onClick={()=>Navigator(`/facture/edit/${e.no_inv}`)}><img src={Pen} alt={`Edit ${e.no_inv}`} width={'40px'} /></button>
                          <button onClick={()=>Supprimer(e.no_inv)}><img src={Bin} alt={`Delete ${e.no_inv}`} width={'40px'} /></button>
                        </td>
                      </tr>
                    ))
                  }
              </tbody>
            </table>
          </div>
      </div>
  )
}
