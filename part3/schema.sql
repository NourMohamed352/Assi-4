create DATABASE small_store;
-- table product
create table Products (
                          id    INT PRIMARY KEY AUTO_INCREMENT,
                          name  TEXT NOT NULL ,
                          price NUMERIC(10,2) NOT NULL check (  price >0 ),
                          stock INT NOT NULL check (  stock >=0 ) ,
                          supplier_id INT REFERENCES Suppliers(id) on DELETE RESTRICT
);

-- table Supplier
create table Suppliers (
                           id  INT PRIMARY KEY AUTO_INCREMENT,
                           name TEXT NOT NULL ,
                           phone TEXT
);

-- table Sale
create table Sales(
                      id INT PRIMARY KEY AUTO_INCREMENT,
                      quantitySold INT NOT NULL ,
                      saledate DATE,
                      Product_ID INT REFERENCES Products(id) on DELETE RESTRICT
);

 -- select *from Products;

-- Q5.1
ALTER TABLE Products ADD COLUMN Category VARCHAR(100);

-- Q5.2
ALTER TABLE Products DROP COLUMN Category;

-- Q5.3
ALTER TABLE Suppliers MODIFY phone VARCHAR(15);

-- Q5.4
ALTER TABLE Products MODIFY name VARCHAR(255) NOT NULL;


