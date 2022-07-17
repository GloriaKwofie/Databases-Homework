const express = require("express");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");
//const { request } = require("express");

const PORT = 4000;
const app = express();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_commerce",
  password: "",
  port: 5432,
});

app.use(bodyParser.json());

// Week two Homework

app.get("/customers", function (req, res) {
  pool.query("SELECT * FROM customers", (response, error) => {
    if (error) {
      console.log("something went wrong " + error);
    }
    res.json(response.rows);
  });
});

app.get("/customers", (req, res) => {
  pool
    .query("select * from customers")
    .then((response) => res.json(response.rows))
    .catch((error) => console.log("Something went wrong " + error));
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

//Week three homework

app.get("/products", async (req, res) => {
  try {
    const selectProducts = await pool.query(
      "select products.product_name,suppliers.supplier_name from products INNER join suppliers on products.supplier_id=suppliers.id"
    );
    res.json(selectProducts.rows);
  } catch (err) {
    console.error(err.message);
  }
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

app.get("/customers/:customerId", (req, res) => {
  const customerId = req.params.customerId;

  const customersById = "select * from customers where id = $1";

  pool
    .query(customersById, [customerId])
    .then((result) => {
      if (result.rows.length > 0) {
        res.json(result.rows);
      } else {
        res.status(400).send(`ID does not exist`);
      }
    })
    .catch((error) => console.log("Something is wrong " + error));
});
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
          .then(() => res.send("New product created!"))
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

//Add a new PUT endpoint /customers/:customerId to update an existing customer (name, address, city and country).

app.put("/customers/:customerId", function (req, res) {
  const name = req.params.name;
  const address = req.body.address;
  const city = req.body.city;
  const country = req.body.country;

  const queryResult =
    "UPDATE customers SET  name=$1, address=$2, city=$3, country=$4 WHERE id=$5";
  pool
    .query(queryResult, [name, address, city, country, customerId])
    .then(() => res.send(`Customer ${customerId} updated!`))
    .catch((e) => console.error(e));
});

//Add a new DELETE endpoint /orders/:orderId to delete an existing order along all the associated order items.

app.delete("/orders/:orderId", function (req, res) {
  const orderId = req.params.orderId;

  pool
    .query("DELETE FROM order_items WHERE order_id=$1", [orderId])
    .then(() => {
      pool
        .query("DELETE FROM order WHERE id=$1", [orderId])
        .then(() => res.send(`order ${orderId} has been deleted!`))
        .catch((e) => console.error(e));
    })
    .catch((e) => console.error(e));
});

//Add a new DELETE endpoint /customers/:customerId to delete an existing customer only if this customer doesn't have orders.

app.delete("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const checkOrdersOfTheCustomer =
    "select * from orders where orders.customer_id = $1";
  const deleteClient = "DELETE from customers where id = $1";

  pool
    .query(checkOrdersOfTheCustomer, [customerId])
    .then((result) => {
      if (result.rows.length > 0) {
        res
          .status(400)
          .send(
            " Customer can not be deleted " +
              customerId +
              " because it has orders"
          );
      } else {
        pool
          .query(deleteClient, [customerId])
          .then(() => res.send(`Customer ${customerId} deleted!`))
          .catch((e) => console.error(e));
      }
    })
    .catch((error) => console.error("Something is wrong " + error));
});
// Add a new GET endpoint /customers/:customerId/orders to load all the orders along the items in the orders of a specific customer.
// Especially, the following information should be returned: order references, order dates, product names, unit prices, suppliers and quantities.
app.get("/customers/:customerId/orders", (req, res) => {
  let customerId = req.params.customerId;

  const getCustomerOrders =
    "select o.order_reference, o.order_date, p.product_name, p.unit_price, s.supplier_name " +
    "from orders o join order_items oi on o.id = oi.order_id " +
    "join products p on p.id = oi.product_id " +
    "join suppliers s on p.supplier_id = s.id " +
    "where o.customer_id = $1";
  pool
    .query(getCustomerOrders, [customerId])
    .then((result) => res.json(result.rows))
    .catch((error) => console.error("Something is wrong " + error));
});

app.listen(PORT, function () {
  console.log(
    "Server is listening on port " + PORT + ". Ready to accept requests!"
  );
});
