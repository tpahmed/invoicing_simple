const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const App = express();

const AllowAll = (req,res,next)=>{

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
}
App.use(bodyparser.json());
App.use(bodyparser.urlencoded({extended:1}));
App.use(AllowAll);

const conx = mysql.createConnection({
    host:process.env.HOST,
    port:process.env.PORT,
    user:process.env.USER,
    password:process.env.PASS,
    database:process.env.DB
})

App.get('/societe',(req,res)=>{
    conx.query(`SELECT *
                FROM Societe 
                where id_societe = 1;`
                ,(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result[0]})
    })
});

App.post('/societe',(req,res)=>{
    conx.query('Update societe set Raison_S = ?, Adresse = ?, Email = ?',[
        req.body.Raison_S,
        req.body.Adresse,
        req.body.Email
    ],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return;
        }
        res.json({success:true,data:result});
    })
});

App.get('/client',(req,res)=>{
    conx.query('Select Nom as `value`,id_client as `id`,Adresse from client;',(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result})
    })
});

App.get('/client/:id',(req,res)=>{
    conx.query('Select * from client where id_client = ?;',[req.params.id],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result})
    })
});

App.post('/client',(req,res)=>{
    conx.query('INSERT INTO client VALUES (NULL,?,?)',[
        req.body.ClientName,
        req.body.ClientAddress
    ],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result})
    })
});


App.get('/cat',(req,res)=>{
    conx.query(`
    SELECT Categorie as id, Categorie as value
    FROM Categorie;
    `,(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result})
    })
});


App.post('/cat',(req,res)=>{
    conx.query('INSERT INTO Categorie VALUES (?)',[
        req.body.Categorie
    ],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result})
    })
});


App.get('/produit',(req,res)=>{
    conx.query(`
    SELECT Description as id, Description as value, Categorie, Price
    FROM Produit;
    `,(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result})
    })
});

App.post('/produit/edit',(req,res)=>{
    conx.query(`
    Update Produit
    set Price = ?
    Where Description = ? and Categorie = ?;
    `,[
        req.body.ProduitPrice,
        req.body.ProduitDescription,
        req.body.Categorie
    ],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result})
    })
});

App.post('/produit',(req,res)=>{
    conx.query('INSERT INTO Produit VALUES (?,?,?)',[
        req.body.ProduitDescription,
        req.body.ProduitPrice,
        req.body.Categorie
    ],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result})
    })
});


App.get('/facture',(req,res)=>{
    conx.query(`
    SELECT *
    FROM invoice;
    `,(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
            
        }
        res.json({success:true,data:result})
    })
});

App.get('/facture/s/:id',(req,res)=>{
    conx.query(`
    SELECT *
    FROM invoice
    Where no_inv = ?;
    `,[req.params.id],(err,result)=>{
        if(err || !result[0]){
            res.json({success:false,data:err})
            return
            
        }
        res.json({success:true,data:result[0]})
    })
});

App.get('/facture/command/:id',(req,res)=>{
    conx.query(`
    SELECT InvoiceProducts.*,InvoiceProducts.Qty as Qte, Produit.Price AS Price, Categorie.Categorie AS Item,Produit.Price*InvoiceProducts.Qty as Total
    FROM Invoice
    JOIN InvoiceProducts ON Invoice.no_inv = InvoiceProducts.no_inv
    JOIN Produit ON InvoiceProducts.Categorie = Produit.Categorie and InvoiceProducts.Description = Produit.Description
    JOIN Categorie ON Produit.Categorie = Categorie.Categorie
    Where InvoiceProducts.no_inv = ?;
    `,[req.params.id],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
            
        }
        res.json({success:true,data:result})
    })
});

App.post('/facture/:id',(req,res)=>{
    conx.query(`
    Update invoice
    set Payed = Payed + ?
    Where no_inv = ?;
    `,[
        req.body.Amount,
        req.params.id
    ],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
            
        }
        res.json({success:true,data:result})
    })
});

App.post('/facture/edit/:id',(req,res)=>{
    conx.query(`
    Update invoice
    set invoiceTo = ?,
    Note = ?,
    Total = ?,
    Taxes = ?
    Where no_inv = ?;
    `,[
        req.body.invoiceTo,
        req.body.Note,
        req.body.Total,
        req.body.Taxes,
        req.params.id
    ],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
        }
        for (let e in req.body.ProduitsCommander){
            if(!req.body.ProduitsCommander[e].id_invoiceProducts){
                conx.query(`INSERT INTO Invoiceproducts VALUES (Null,?,?,?,?)`,[
                    req.body.ProduitsCommander[e].Description,
                    req.body.ProduitsCommander[e].Item,
                    req.body.ProduitsCommander[e].no_inv,
                    req.body.ProduitsCommander[e].Qte
                ])
            }
        }
        res.json({success:true,data:result})
    })
});

App.get('/facture/num',(req,res)=>{
    conx.query(`
    SELECT count(no_inv) as num
    FROM invoice
    Where year(Date_inv) = ?;
    `,[new Date().getFullYear()],(err,result)=>{
        if(err !== null){
            res.json({success:false,data:err})
            return
        }
        res.json({success:true,data:result[0]})
    })
});

App.post('/facture',(req,res)=>{
    conx.query(`INSERT INTO Invoice VALUES (?,?,?,?,?,?,?)`,[
        req.body.no_inv,
        req.body.Date_inv,
        Number(req.body.id_client),
        req.body.Note ? req.body.Note : `Here we can write a additional notes for the client to get a better understanding of this invoice.`,
        req.body.Total,
        req.body.Taxes,
        0
    ],async (err,result)=>{
        if(err){
            console.log(err)
            res.json({success:false,data:err})
            return
        }
        for (let e in req.body.ProduitsCommander){
            conx.query(`INSERT INTO Invoiceproducts VALUES (Null,?,?,?,?)`,[
                req.body.ProduitsCommander[e].Description,
                req.body.ProduitsCommander[e].Item,
                req.body.ProduitsCommander[e].no_inv,
                req.body.ProduitsCommander[e].Qte
            ])
        }
        res.json({success:true,data:result})
    })
});

App.delete('/facture/:id',(req,res)=>{
    conx.query(`
    DELETE FROM invoice
    WHERE no_inv = ?;
    `,[req.params.id],(err,result)=>{
        if(err){
            res.json({success:false,data:err})
            return
            
        }
        res.json({success:true,data:result})
    })
});


App.listen(4444);