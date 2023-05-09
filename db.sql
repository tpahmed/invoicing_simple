create database Ivonne_simple;

use Ivonne_simple;

create table Societe(
    id_societe int auto_increment primary key,
    Raison_S varchar(50),
    Adresse text,
    Email varchar(50)
);

insert into Societe values (NULL,'','','');

create table Client(
    id_client int auto_increment primary key,
    Nom varchar(50),
    Adresse text
);

create table Categorie(
    Categorie varchar(20) primary key
);

create table Produit(
    Description varchar(50),
    Price float,
    Categorie varchar(20) references Categorie(Categorie),
    constraint PK_Prod primary key (Description,Categorie)
);


create table Invoice(
    no_inv varchar(50) primary key,
    Date_inv date,
    invoiceTo int references Client(id_client),
    Note text,
    Total float,
    Taxes float,
    Payed float
);

create table InvoiceProducts(
    id_invoiceProducts int auto_increment primary key,
    Description varchar(50) references Produit(Description),
    Categorie varchar(20) references Produit(Categorie),
    no_inv varchar(20) references Invoice(no_inv),
    Qty int
);

CREATE TRIGGER trg_inv AFTER DELETE on invoice for EACH ROW
delete FROM invoiceproducts WHERE no_inv = old.no_inv;

