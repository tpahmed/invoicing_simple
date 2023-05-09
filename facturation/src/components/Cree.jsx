import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DatalistInput from 'react-datalist-input';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Add from '../assets/Plus.svg'
import Bin from '../assets/Bin.svg'
import Logo from '../assets/Logo.svg'
import './Cree.css';
import axios from 'axios';

export default function CreeFacture() {
    const [Facture,SetFacture] = useState({no_inv:'',id_client:'',Note:''});
    const [Societe,SetSociete] = useState({Raison_S:'',Adresse:'',Email:''});

    const [ProduitsCommander,SetProduitsCommander] = useState([]);
    const [Clients,SetClients] = useState([]);
    const [Categories,SetCategories] = useState([]);
    const [Produits,SetProduits] = useState([]);
    const [Categorie,SetCategorie] = useState('');
    const [ProduitDescription,SetProduitDescription] = useState('');
    const [ProduitPrice,SetProduitPrice] = useState('');
    const [ProduitQty,SetProduitQty] = useState('');
    const [ClientName,SetClientName] = useState('');
    const [ClientAddress,SetClientAddress] = useState('');
    const [Tax,SetTax] = useState(20);
    const Navigator = useNavigate();
    const dt = new Date();
    

    
    const AjouterProd = ()=>{
        if (!Categories.filter(e=>e.id === Categorie).length){
            axios.post('//localhost:4444/cat',{Categorie});
        }
        if (!Produits.filter(e=>e.id === ProduitDescription).length){
            axios.post('//localhost:4444/Produit',{Categorie,ProduitDescription,ProduitPrice});
        }
        else{
            axios.post('//localhost:4444/Produit/edit',{Categorie,ProduitDescription,ProduitPrice});
        }
        SetProduitsCommander([...ProduitsCommander,{no_inv:`F${dt.getFullYear()}${Facture.no_inv}`,Item:Categorie,Description:ProduitDescription,Qte:ProduitQty,Price:ProduitPrice,Total:ProduitQty*ProduitPrice}]);
        SetCategorie('');
        SetProduitDescription('');
        SetProduitPrice('');
        SetProduitQty('');
        update();
    }
    
    const Cree = async ()=>{
        if(!ProduitsCommander[0] || !ClientName){
            return
        }
        if (!Clients.filter(e=>e.value === ClientName).length){
            await axios.post('//localhost:4444/client',{ClientName,ClientAddress});
        }

        await axios.post('//localhost:4444/facture',{...Facture,no_inv:`F${dt.getFullYear()}${Facture.no_inv}`,Taxes:Tax,Total:ProduitsCommander.reduce((prev,curr,indx)=>ProduitsCommander[indx].Total+prev,0),Date_inv:`${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()}`,ProduitsCommander});

        await axios.post('//localhost:4444/societe',Societe);
        

    }

    const Print = async ()=>{
        await Cree();
        const PageToPrint = document.getElementById('CreeFacture-Print-page');
        PageToPrint.src = `http://localhost:5173/facture/view/F${dt.getFullYear()}${Facture.no_inv}`;
        const LoadingWaiter = ()=>{
            const ContentToPrint = PageToPrint.contentWindow || PageToPrint;
            if (ContentToPrint.document.body.querySelector(".AfficherFacture-Facture-Line p") && ContentToPrint.document.body.querySelector(".AfficherFacture-Facture-Line p").textContent.trim()){
                PageToPrint.focus();
                ContentToPrint.print();
                Navigator('/facture/gere');
            }
            else{              
                setTimeout(()=>{                
                    LoadingWaiter()
                },1000)
            }
        }
        PageToPrint.addEventListener('load',()=>{
            LoadingWaiter()
        },{once:true})
    }
    
    

    function update(){
        axios.get('//localhost:4444/facture/num').then(e=>{
            SetFacture({...Facture,no_inv:e.data.data.num})
        });
        axios.get('//localhost:4444/client').then(e=>{
            SetClients(e.data.data)
        });
        axios.get('//localhost:4444/cat').then(e=>{
            SetCategories(e.data.data)
        })
        axios.get('//localhost:4444/produit').then(e=>{
            SetProduits(e.data.data)
        })
    }
    useEffect(()=>{
        axios.get('//localhost:4444/societe').then(e=>{
            SetSociete(e.data.data)
        });
        update();
    },[]);
    useEffect(()=>{
        SetProduits(Produits.filter((e)=>e.Categorie === Categorie));
    },[Categorie]);
    
    
    return (
    <div className="CreeFacture">
        <iframe style={{visibility:'hidden',height:'0'}} title="CreeFacture-Print" id='CreeFacture-Print-page'></iframe>
        <div className="CreeFacture-Line">
            <div className='CreeFacture-InfoInitial'>
                <div>Invoice No: <span>#F{dt.getFullYear()}{Facture.no_inv}</span></div>
                <div>Date: <span>{dt.getDate()}.{dt.getMonth()+1}.{dt.getFullYear()}</span></div>

            </div>
            <img src={Logo} alt="logo" width={'120px'}  onClick={()=>Navigator('/facture/gere')} />
        </div>
        <div className="CreeFacture-Line">
            <div className='CreeFacture-Transaction-Info'>
                <h4>Invoice To:</h4>
                <DatalistInput
                    placeholder="Name"
                    value={ClientName}
                    setValue={SetClientName}
                    items={Clients}
                    showLabel={false}
                    onSelect={item=>{
                        SetFacture({...Facture,id_client:item.id}); 
                        SetClientAddress(item.Adresse)
                    }}
                />
                <textarea type='text' placeholder='Address' value={ClientAddress} onChange={(e)=>{SetClientAddress(e.target.value)}}></textarea>

            </div>
            <div className='CreeFacture-Transaction-Info'>
                <h4>Pay To:</h4>
                <input type='text' placeholder='Name' value={Societe.Raison_S} onChange={(e)=>{SetSociete({...Societe,Raison_S:e.target.value});}}/>
                <textarea type='text' placeholder='Address' value={Societe.Adresse} onChange={(e)=>{SetSociete({...Societe,Adresse:e.target.value});}}></textarea>
                <input type='text' placeholder='Email' value={Societe.Email} onChange={(e)=>{SetSociete({...Societe,Email:e.target.value});}}/>
            </div>
        </div>
        <div className="CreeFacture-Line">
            
            <DatalistInput
                    placeholder="Category"
                    value={Categorie}
                    setValue={SetCategorie}
                    items={Categories}
                    showLabel={false}
                    onSelect={item=>{}}
                />
            <DatalistInput
                    placeholder="Description"
                    value={ProduitDescription}
                    setValue={SetProduitDescription}
                    items={Produits}
                    showLabel={false}
                    onSelect={item=>{
                        SetProduitPrice(item.Price);
                    }}
                    style={Categorie ? null : { visibility:'hidden' }}
                    
                />
            <input type='text' placeholder='Price' style={ProduitDescription && Categorie ? null : { visibility:'hidden' }} value={ProduitPrice} onChange={(e)=>{!isNaN(Number(e.target.value)) ? SetProduitPrice(e.target.value) : ''}}/>
            <input type='text' placeholder='Qty.' style={ProduitPrice && ProduitDescription && Categorie ? null : { visibility:'hidden' }} value={ProduitQty} onChange={(e)=>{!isNaN(Number(e.target.value)) ? SetProduitQty(e.target.value) : ''}}/>
            <img src={Add} alt="Add Product" style={Number(ProduitQty) && ProduitPrice && ProduitDescription && Categorie ? null : { visibility:'hidden' }} onClick={AjouterProd} width={'40px'} />
        </div>
        <div className="CreeFacture-Line">
            <div className="CreeFacture-List">
                <table className='CreeFacture-table'>
                    <thead>
                    <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Supprimer</th>
                    </tr>
                    </thead>
                    <tbody>
                    
                        {
                        ProduitsCommander.map((e,index)=>(
                            <tr key={`${e.Item}-${e.Description}`}>
                                <td>{e.Item}</td>
                                <td>{e.Description}</td>
                                <td>{e.Qte}</td>
                                <td>${e.Price}</td>
                                <td>${e.Total}</td>
                                <td><img src={Bin} alt={`Supprimer ${e.Description}`} width={'30px'} onClick={()=>SetProduitsCommander(ProduitsCommander.filter((el,indx)=> index != indx))} /></td>
                            </tr>
                        ))
                        }
                    </tbody>
                    <tfoot style={{ fontFamily:"Inter-Bold" }}>
                        <tr>
                            <td colSpan={2} rowSpan={3}>Tax : <input type='text' id='CreeFacture-Tax' value={Tax} onChange={(e)=>{!isNaN(Number(e.target.value)) && Number(e.target.value) < 100 ? SetTax(Number(e.target.value)) : ''}}/>%</td>
                            <td colSpan={2}>SubTotal</td>
                            <td>${ProduitsCommander.reduce((prev,curr,indx)=>ProduitsCommander[indx].Total+prev,0)}</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>Tax</td>
                            <td>-${(ProduitsCommander.reduce((prev,curr,indx)=>ProduitsCommander[indx].Total+prev,0)*Tax)/100}</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ fontSize:'1.5em',fontWeight:"1000" }}>Total Amount</td>
                            <td>${ProduitsCommander.reduce((prev,curr,indx)=>ProduitsCommander[indx].Total+prev,0)+(ProduitsCommander.reduce((prev,curr,indx)=>ProduitsCommander[indx].Total+prev,0)*Tax)/100}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        <div className="CreeFacture-Line">
            <textarea value={Facture.Note} placeholder='Note' style={{ width:'100%' }} onChange={e=>SetFacture({...Facture,Note:e.target.value})}></textarea>
        </div>
        <div className="CreeFacture-Line">
            <button className="CreeFacture-Button" onClick={Cree}>
                Save
            </button>
            <button className="CreeFacture-Button" onClick={Print}>
                Save and Print
            </button>
        </div>
    </div>
  )
}