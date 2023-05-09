import './Afficher.css';
import Logo from '../assets/logo.svg'
import Note from '../assets/Note.svg'
import Print from '../assets/Print.svg'
import Download from '../assets/Download.svg'
import { useState,useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function AfficherFacture() {
    const [Small,setSmall] = useState(window.innerWidth < 767)
    window.addEventListener('resize',()=>setSmall(window.innerWidth < 767));
    const FactureRef = useRef(null);
    function TelechargerPDF() {
        html2canvas(FactureRef.current).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const ratio = canvas.width / canvas.height;
            const imgWidth = pageWidth - 20;
            const imgHeight = imgWidth / ratio;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`${id}.pdf`);
          });
    };
    const Navigator = useNavigate();
    const {id} = useParams();
    const [Facture,SetFacture] = useState({});
    const [CommandFacture,SetCommandFacture] = useState([]);
    const [Client,SetClient] = useState([]);
    const [Societe,SetSociete] = useState([]);
    useEffect(()=>{
        axios.get(`//localhost:4444/facture/s/${id}`).then((e)=>{
            if(!e.data.success){
                Navigator('/facture/gere');
            }
            SetFacture(e.data.data)
        });
    },[]);
    useEffect(()=>{
        if(Facture.invoiceTo){
            axios.get(`//localhost:4444/facture/command/${id}`).then((e)=>{
                SetCommandFacture(e.data.data)
            });
            axios.get(`//localhost:4444/client/${Facture.invoiceTo}`).then((e)=>{
                SetClient(e.data.data[0])
            });
            axios.get(`//localhost:4444/societe`).then((e)=>{
                SetSociete(e.data.data)
            });
        }
        
    },[Facture]);
  return (
    <div className="AfficherFacture">
        <div className="AfficherFacture-Facture">
            <div className="AfficherFacture-Facture-Donne" ref={FactureRef}>
                <div className="AfficherFacture-Facture-Line">
                    <div>
                        <div><b>Invoice No: </b> #{Facture.no_inv}</div>
                        <div><b>Date: </b> {new Date(Date.parse(Facture.Date_inv)).toLocaleDateString('en-GB').replace(/\//gi,'.')}</div>
                    </div>
                    <img src={Logo} alt="Logo" onClick={()=>Navigator('/facture/gere')}/>
                </div>
                <hr />
                <div className="AfficherFacture-Facture-Line" style={{ "alignItems":'flex-start' }}>
                    <div style={{ textAlign:"left" }}>
                        <b>Invoice To: </b>
                        <p>
                            {Client.Nom}<br/>
                            {Client.Adresse}
                        </p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                        <b>Pay To: </b>
                        <p>
                            {Societe.Raison_S}<br/>
                            {Societe.Adresse}<br/>
                            {Societe.Email}
                        </p>
                    </div>
                </div>
                <div className='AfficherFacture-Facture-Table'>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th style={{ textAlign:"right" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CommandFacture ? CommandFacture.map((e,index)=>(
                                <tr key={index}>
                                    <td>{e.Categorie}</td>
                                    <td>{e.Description}</td>
                                    <td>{e.Qte}</td>
                                    <td>${e.Price}</td>
                                    <td>${e.Price*e.Qte}</td>
                                </tr>
                            )):''}
                            
                            
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={2} rowSpan={2}>
                                    <b style={{ color:"var(--Black)" }}>Additional Information:</b> <br />

                                    At check in you may need to present the credit<br/>
                                    card used for payment of this ticket.
                                </td>
                                <th colSpan={Small ? 3 : 1}>Subtotal</th>
                                <th colSpan={2}>${Facture.Total}</th>
                            </tr>
                            <tr>
                                <th colSpan={Small ? 3 : 1}>Tax</th>
                                <th colSpan={2}>-${Facture.Total*Facture.Taxes/100}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="AfficherFacture-Facture-Line" style={{ "paddingLeft":'1.3em',"paddingRight":'1.3em' }}>
                    <b>Total Amount</b>
                    <b>${Facture.Total+(Facture.Total*Facture.Taxes/100)}</b>
                </div>
                <div className='AfficherFacture-Facture-Note'>
                    <img src={Note} alt="Note" style={{ width:'32px' }} />
                    <div>
                        <b>Note:</b>
                        <p>{Facture.Note}</p>
                    </div>
                </div>
            </div>
            <div className="AfficherFacture-Facture-Options">
                <button id='AfficherFacture-Facture-Options-Imprimer' onClick={()=>window.print()}>
                    <img src={Print} alt="Imprimer" width={"24px"} style={{ marginLeft:"5px" }} />
                    <span>Print</span>
                </button>
                <button id='AfficherFacture-Facture-Options-Telecharger' onClick={TelechargerPDF}>
                    <img src={Download} alt="Telecharger" width={"24px"} style={{ marginLeft:"5px" }} />
                    <span>Download</span>
                </button>
            </div>
        </div>
    </div>
  )
}
