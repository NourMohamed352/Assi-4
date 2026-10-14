const express = require('express');
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: "",
    database: 'small_store'
});

const app = express();
app.use(express.json());


//Q2.1 -- Create product
app.post('/create', async (req, res) => {
    console.log('Body received:', req.body);

    try {
        const { name, price, stock, supplier_id } = req.body;

        if (!name || price === undefined || stock === undefined || !supplier_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const query = 'INSERT INTO Products (name, price, stock, supplier_id) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(query, [name, price, stock, supplier_id]);

        res.status(201).json({ message: 'Product created', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Q2.2 -- Get all products
app.get('/get', async (req, res) => {
    try {
        const query = 'SELECT * FROM Products';
        const [result] = await pool.query(query);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Q2.3 -- Get product by ID
app.get('/get/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM Products WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(result[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Q2.4 -- Update product
app.patch('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const fields = req.body;

        if (Object.keys(fields).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const columns = Object.keys(fields).map(col => `${col} = ?`).join(', ');
        const values = [...Object.values(fields), id];
        const query = `UPDATE Products SET ${columns} WHERE id = ?`;
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Q2.5 -- Delete product
app.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = 'DELETE FROM Products WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Q3.1 --create supplier
app.post('/suppliers', async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const query = 'INSERT INTO Suppliers (name, phone) VALUES (?, ?)';
        const [result] = await pool.query(query, [name, phone]);

        res.status(201).json({
            message: 'Supplier created successfully',
            supplierId: result.insertId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Q3.2 -- retrieve all suppliers
app.get('/suppliers', async (req, res) => {
    try {
        const query = 'SELECT * FROM Suppliers';
        const [result] = await pool.query(query);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Q3.3 --update supplier
app.patch('/update_supplier/:id', async (req, res) => {
    const id = req.params.id;
    const fields = req.body;
    const columns = Object.keys(fields).map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(fields), id];
    const query = `UPDATE Suppliers SET ${columns} WHERE id = ?`;
    await pool.query(query, values);

    res.json({ message: 'Supplier updated' });
});

// َQ3.4 --delete supplier
app.delete('/delete_supplier/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const query = 'DELETE FROM Suppliers WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Q4.1 -- Record a sale
app.post('/sale', async (req, res) => {
    const { quantitySold, saledate, Product_ID } = req.body;

    const query = 'INSERT INTO Sales (quantitySold, saledate, Product_ID) VALUES (?, ?, ?)';
    await pool.query(query, [quantitySold, saledate, Product_ID]);

    res.json({ message: 'Sale recorded' });
});

// Q4.2 -- Retrieve all sales
app.get('/sales', async (req, res) => {
    const query = 'SELECT * FROM Sales';
    const [result] = await pool.query(query);

    res.json(result);
});

//Q4.3 -- Retrieve sales for a specific product.
app.get('/sales/product/:productId', async (req, res) => {
    const productId = req.params.productId;

    const query = 'SELECT * FROM Sales WHERE Product_ID = ?';
    const [result] = await pool.query(query, [productId]);

    res.json(result);
});

//Q9 -- total quantity
app.get('/total_sold', async (req, res) => {
    try {
        const query = `
            SELECT 
                Products.id AS product_id,
                Products.name AS product_name,
                SUM(Sales.quantitySold) AS total_quantity_sold
            FROM Products
            LEFT JOIN Sales ON Products.id = Sales.Product_ID
            GROUP BY Products.id, Products.name
            ORDER BY total_quantity_sold DESC
        `;

        const [result] = await pool.query(query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Q10 --product with the highest stock quantity
app.get('/highest_stock', async (req, res) => {
    try {
        const query = `
            SELECT id, name, price, stock, supplier_id
            FROM Products
            ORDER BY stock DESC
            LIMIT 1
        `;

        const [result] = await pool.query(query);

        if (result.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Q11 --suppliers whose names start with 'F'
app.get('/suppliers_f', async (req, res) => {
    try {
        const query = "SELECT * FROM Suppliers WHERE name LIKE 'F%'";
        const [result] = await pool.query(query);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Q12 --Products that have never been sold
app.get('/never_sold', async (req, res) => {
    try {
        const query = `
            SELECT Products.id, Products.name, Products.price, Products.stock
            FROM Products
            LEFT JOIN Sales ON Products.id = Sales.Product_ID
            WHERE Sales.id IS NULL
        `;

        const [result] = await pool.query(query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Q13 --All sales with product details
app.get('/sales_details', async (req, res) => {
    try {
        const query = `
            SELECT 
                Sales.id AS sale_id,
                Products.name AS product_name,
                Sales.quantitySold AS quantity_sold,
                Sales.saledate AS sale_date
            FROM Sales
            JOIN Products ON Sales.Product_ID = Products.id
            ORDER BY Sales.saledate DESC
        `;

        const [result] = await pool.query(query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));