import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DatalistInput from 'react-datalist-input';
import Add from '../assets/Plus.svg'
import Bin from '../assets/Bin.svg'
import Logo from '../assets/Logo.svg'
import './Modifier.css';
import axios from 'axios';

export default function ModifierFacture() {
    const refund = false;
    const {id} = useParams();

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
    

    
    const AjouterProd = async ()=>{
        if (!Categories.filter(e=>e.id === Categorie).length){
            await axios.post('//localhost:4444/cat',{Categorie});
        }
        if (!Produits.filter(e=>e.id === ProduitDescription).length){
            await axios.post('//localhost:4444/Produit',{Categorie,ProduitDescription,ProduitPrice});
        }
        else{
            await axios.post('//localhost:4444/Produit/edit',{Categorie,ProduitDescription,ProduitPrice});
        }
        SetProduitsCommander([...ProduitsCommander,{no_inv:`${Facture.no_inv}`,Item:Categorie,Description:ProduitDescription,Qte:ProduitQty,Price:ProduitPrice,Total:ProduitQty*ProduitPrice}]);
        SetCategorie('');
        SetProduitDescription('');
        SetProduitPrice('');
        SetProduitQty('');
    }
    
    const Modifier = async ()=>{
        if(!ProduitsCommander[0] || !ClientName){
            alert("Invoice not completed")
            return;
        }
        if(!refund && ProduitsCommander.reduce((prev,curr,indx)=>ProduitsCommander[indx].Total+prev,0)*(100+Tax)/100 < Facture.Total*(100+Facture.Taxes)/100){
            alert("Refund is denied")
            return;
        }
        if (!Clients.filter(e=>e.value === ClientName).length){
            await axios.post('//localhost:4444/client',{ClientName,ClientAddress});
        }

        await axios.post(`//localhost:4444/facture/edit/${Facture.no_inv}`,{...Facture,Taxes:Tax,Total:ProduitsCommander.reduce((prev,curr,indx)=>ProduitsCommander[indx].Total+prev,0),ProduitsCommander});

        await axios.post('//localhost:4444/societe',Societe);

        Navigator('/facture/gere');
    };

    function update(){
        axios.get(`//localhost:4444/facture/s/${id}`).then(e=>{
            SetFacture(e.data.data)
            SetTax(e.data.data.Taxes);
            
        });
        axios.get('//localhost:4444/cat').then(e=>{
            SetCategories(e.data.data)
        })
        axios.get('//localhost:4444/produit').then(e=>{
            SetProduits(e.data.data)
        })
        axios.get('//localhost:4444/client').then(e=>{
            SetClients(e.data.data)
        });
        axios.get(`//localhost:4444/facture/command/${id}`).then(e=>{
            SetProduitsCommander(e.data.data)
        })
    }
    
    useEffect(()=>{
        axios.get('//localhost:4444/societe').then(e=>{
            SetSociete(e.data.data)
        });
        update();
        console.log(Facture);
    },[]);
    useEffect(()=>{
        SetProduits(Produits.filter((e)=>e.Categorie === Categorie));
    },[Categorie]);
    useEffect(()=>{
        if(Facture.invoiceTo){
            axios.get(`//localhost:4444/client/${Facture.invoiceTo}`).then(e=>{
                    SetClientName(e.data.data[0].Nom);
                    SetClientAddress(e.data.data[0].Adresse);
                });
        }
    },[Facture]);
    
    
    return (
    <div className="ModifierFacture">
        <iframe style={{visibility:'hidden',height:'0'}} title="ModifierFacture-Print" id='ModifierFacture-Print-page'></iframe>
        <div className="ModifierFacture-Line">
            <div className='ModifierFacture-InfoInitial'>
                <div>Invoice No: <span>#{Facture.no_inv}</span></div>
                <div>Date: <span>{new Date(Date.parse(Facture.Date_inv)).toLocaleDateString('en-GB').replace(/\//gi,'.')}</span></div>

            </div>
            <img src={Logo} alt="logo" width={'120px'} onClick={()=>Navigator('/facture/gere')} />
        </div>
        <div className="ModifierFacture-Line">
            <div className='ModifierFacture-Transaction-Info'>
                <h4>Invoice To:</h4>
                <DatalistInput
                    placeholder="Name"
                    value={ClientName}
                    setValue={SetClientName}
                    items={Clients}
                    showLabel={false}
                    onSelect={item=>{
                        SetFacture({...Facture,invoiceTo:item.id}); 
                        SetClientAddress(item.Adresse)
                    }}
                    
                />
                <textarea type='text' placeholder='Address' value={ClientAddress} onChange={(e)=>{SetClientAddress(e.target.value)}}></textarea>

            </div>
            <div className='ModifierFacture-Transaction-Info'>
                <h4>Pay To:</h4>
                <input type='text' placeholder='Name' value={Societe.Raison_S} onChange={(e)=>{SetSociete({...Societe,Raison_S:e.target.value});}}/>
                <textarea type='text' placeholder='Address' value={Societe.Adresse} onChange={(e)=>{SetSociete({...Societe,Adresse:e.target.value});}}></textarea>
                <input type='text' placeholder='Email' value={Societe.Email} onChange={(e)=>{SetSociete({...Societe,Email:e.target.value});}}/>
            </div>
        </div>
        <div className="ModifierFacture-Line">
            
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
            <input type='text' placeholder='Price' style={ProduitDescription && Categorie ? { width:'20%' } : { visibility:'hidden' }} value={ProduitPrice} onChange={(e)=>{!isNaN(Number(e.target.value)) ? SetProduitPrice(e.target.value) : ''}}/>
            <input type='text' placeholder='Qty.' style={ProduitPrice && ProduitDescription && Categorie ? { width:'20%' } : { visibility:'hidden' }} value={ProduitQty} onChange={(e)=>{!isNaN(Number(e.target.value)) ? SetProduitQty(e.target.value) : ''}}/>
            <img src={Add} alt="Add Product" style={Number(ProduitQty) && ProduitPrice && ProduitDescription && Categorie ? null : { visibility:'hidden' }} onClick={AjouterProd} width={'40px'} />
        </div>
        <div className="ModifierFacture-Line">
            <div className="ModifierFacture-List">
                <table className='ModifierFacture-table'>
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
                            <td colSpan={2} rowSpan={3}>Tax : <input type='text' id='ModifierFacture-Tax' value={Tax} onChange={(e)=>{!isNaN(Number(e.target.value)) && Number(e.target.value) < 100 ? SetTax(Number(e.target.value)) : ''}}/>%</td>
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
        <div className="ModifierFacture-Line">
            <textarea value={Facture.Note} placeholder='Note' style={{ width:'100%' }} onChange={e=>SetFacture({...Facture,Note:e.target.value})}></textarea>
        </div>
        <div className="ModifierFacture-Line">
            <button className="ModifierFacture-Button" onClick={Modifier}>
                Save
            </button>
        </div>
    </div>
  )
}