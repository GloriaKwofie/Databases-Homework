const express = require("express");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");

const PORT = 4000;
const app = express();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_commerce",
  password: "Generations39",
  port: 5432,
});

app.use(bodyParser.json());

app.get("/customers", function (req, res) {
  pool.query("SELECT * FROM customers", (response, error) => {
    if (error) {
      console.log("something went wrong " + error);
    }
    res.json(response.rows);
  });
});

app.get("/suppliers", function (req, res) {
  pool.query(
    "select supplier name as name, country from suppliers",
    (response, error) => {
      if (error) {
        console.log("something went wrong " + error);
      }
      res.json(response.rows);
    }
  );
});

app.get("/products", function (req, res) {
  pool.query(
    "select p.product_name, p.unit_price, s.supplier_name from products p join suppliers s on s.id = p.supplier_id",
    (response, error) => {
      if (error) {
        console.log("something went wrong " + error);
      }
      res.json(response.rows);
    }
  );
});

app.get("/products", (req, res) => {
  const newproduct = req.query.productname;

  const allProducts =
    "select products.product_name,suppliers.supplier_name " +
    "from products " +
    "INNER join suppliers on products.supplier_id=suppliers.id";

  const productByName =
    "select products.product_name,suppliers.supplier_name " +
    "from products " +
    "INNER join suppliers on products.supplier_id=suppliers.id " +
    "where products.product_name like $1";

  if (newproduct) {
    // We have a name
    pool
      .query(productByName, [newproduct])
      .then((result) => res.json(result.rows));
  } else {
    // No name at all
    pool.query(allProducts).then((result) => {
      res.json(result.rows);
    });
  }
});
//Add a new GET endpoint /customers/:customerId to load a single customer by ID.

//Add a new POST endpoint /customers to create a new customer.

app.post("/customers", function (req, res) {
  const name = req.body.name;
  const country = req.body.country;
  const address = req.body.address;
  const city = req.body.city;

  pool
    .query(
      "Insert into customers(name,address,country,city) Values($1,$2,$3,$4)",
      [name, address, country, city]
    )
    .then(() => res.send("Customer Created"))
    .catch((error) => console.error(error));
});

//Add a new POST endpoint /products to create a new product (with a product name, a price and a supplier id). Check that the price is a positive integer and that the supplier ID exists in the database, otherwise return an error.

app.post("/products", function (req, res) {
  const productName = req.body.product_name;
  const price = req.body.unit_price;
  const supplierId = req.body.supplier_id;

  if (Number.isInteger(price) || supplierId > 0) {
    return res.status(400).send("The price is a  positive integer.");
  }

  pool
    .query("SELECT * FROM products WHERE name=$1", [productName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res.status(400).send("this product already exists!");
      } else {
        const query =
          "INSERT INTO products (product_name, unit_price, supplier_id) VALUES ($1, $2, $3)";
        pool
          .query(query, [productName, price, supplierId])
          .then(() => res.send("Hotel created!"))
          .catch((e) => console.error(e));
      }
    });
});

//Add a new POST endpoint /customers/:customerId/orders to create a new order (including an order date, and an order reference) for a customer. Check that the customerId corresponds to an existing customer or return an error.
app.post("/customers/:customerId/orders", (req, res) => {
  let customerId = req.params.customerId;

  let orderDate = req.body.order_date;
  let orderRef = req.body.order_reference;
  console.log("Id " + customerId);

  const checkCustomer = "select * from customers where id = $1";
  const insertOrder =
    "insert into orders(order_date, order_reference, customer_id) values($1, $2, $3)";

  pool
    .query(checkCustomer, [customerId])
    .then((result) => {
      if (result.rows.length > 0) {
        pool
          .query(insertOrder, [orderDate, orderRef, customerId])
          .then(() => res.send("Order created"))
          .catch((error) =>
            console.error("Something is wrong when adding new order" + error)
          );
      } else {
        res.status(400).send("Customer id " + customerId + " does not exist");
      }
    })
    .catch((error) => console.error("Something is wrong " + error));
});

//Add a new POST endpoint /customers/:customerId/orders to create a new order (including an order date, and an order reference) for a customer. Check that the customerId corresponds to an existing customer or return an error

app.listen(PORT, function () {
  console.log(
    "Server is listening on port " + PORT + ". Ready to accept requests!"
  );
});
