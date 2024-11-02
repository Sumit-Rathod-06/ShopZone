import express from "express"
import bodyParser from "body-parser";
import pg from "pg"

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();  
const port = 3000;

let products = [];
var name;
var password;

const db = new pg.Client({
  user : "postgres",
  host : "localhost",
  database : "shopzone",
  password : "Sumit@06",
  port : 5432
});

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended : true}));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

db.connect();

app.post("/login-customer",async (req,res)=>{

  name = req.body["username"];
  password = req.body["password"];

  const resul = await db.query("Select password from customer where name = $1",[name]);

  if(resul.rows.length > 0)
  {
    const user = resul.rows[0];
    const dbpass = user.password;

    if(dbpass === password)
    {
      const pro = await db.query("Select * From product");
        if(pro.rows <= 0)
        {
          console.log("Error : ",err.stack);
        }
        else
        {
          products = pro.rows;
        }

        res.render("home-customer.ejs",
          {
              products: products
          }
        )
    }
    else{
      res.send("<h1>Incorrect Password</h1>");
    }
  }
  else
  {
    res.send("<h1>Customer not Found</h1>");
  }
})

app.post("/login-seller",async (req,res)=>{

  name = req.body["username"];
  password = req.body["password"];

  const resul = await db.query("Select password from seller where name = $1",[name]);
  const id = await db.query("Select id from seller where name = $1",[name]);

  if(resul.rows.length > 0)
  {
    const user = resul.rows[0];
    const dbpass = user.password;

    if(dbpass === password)
    {
        const pro = await db.query("Select * From product Where sid = $1",[id.rows[0].id]);
        if(pro.rows <= 0)
        {
          products = [];
        }
        else
        {
          products = pro.rows;
        }

        res.render("home-seller.ejs",
          {
              products: products
          }
        )
    }
    else{
      res.send("<h1>Incorrect Password</h1>");
    }
  }
  else
  {
    res.send("<h1>Seller not Found</h1>");
  }
})

app.post("/register-customer",async (req,res)=>{

  name = req.body["username"];
  password = req.body["password"];
  const age = req.body["age"];
  const phone_no = req.body["phone_no"];

  await db.query("Insert Into customer(name,password,age,phone_no) Values ($1,$2,$3,$4)",[name,password,age,phone_no]);
  res.sendFile(__dirname + "/public/login-customer.html");
})

app.post("/register-seller",async (req,res)=>{

  name = req.body["username"];
  password = req.body["password"];
  const age = req.body["age"];
  const phone_no = req.body["phone_no"];

  await db.query("Insert Into seller(name,password,age,phone_no) Values ($1,$2,$3,$4)",[name,password,age,phone_no]);  
  res.sendFile(__dirname + "/public/login-seller.html");
})

app.get("/add-product",(req,res)=>{
  res.sendFile(__dirname + "/public/add-product.html");
})

app.post("/add-product-redirect",async (req,res) => {

  const pname = req.body["pname"];
  const desc = req.body["description"];
  const price = req.body["price"];

  const id = await db.query("Select id from seller where name = $1",[name]);

  await db.query("Insert into product(sid,pname,price,description) values($1,$2,$3,$4)",[id.rows[0].id,pname,price,desc]);

  const pro = await db.query("Select * From product Where sid = $1",[id.rows[0].id]);
  if(pro.rows <= 0)
  {
    products = [];
  }
  else
  {
    products = pro.rows;
  }
  res.render("home-seller.ejs",
    {
        products: products
    }
  )
  
})

app.get("/deleteproduct/:id", async (req, res) => {
  
  await db.query("Delete from product where id = $1",[req.params.id]);

  const id = await db.query("Select id from seller where name = $1",[name]);
  const pro = await db.query("Select * From product Where sid = $1",[id.rows[0].id]);
  if(pro.rows <= 0)
  {
    products = [];
  }
  else
  {
    products = pro.rows;
  }
  res.render("home-seller.ejs",
    {
        products: products
    }
  )});

app.get("/buyproduct/:id",async (req,res) => {

  const pro = await db.query("Select * From product Where id = $1",[req.params.id]);
  if(pro.rows <= 0)
  {
    products = [];
  }
  else
  {
    products = pro.rows;
  }
  res.render("buy-product.ejs",
    {
        products: products
    }
  )
})

app.post("/finallybuyproduct/:id",async (req,res)=>{
  const date = req.body["date"];
  const mode = req.body["payment-mode"];
  const pid = req.params.id;

  const resul = await db.query("Select * from product where id = $1",[pid]);
  const pname = resul.rows[0].pname;
  const price = resul.rows[0].price;

  const id = await db.query("Select id from customer where name = $1",[name]);

  await db.query("Insert into odetails(pid,cid,payment_mode,odate,pname,price) values($1,$2,$3,$4,$5,$6)",[pid,id.rows[0].id,mode,date,pname,price]);

        const pro = await db.query("Select * From product");
        if(pro.rows <= 0)
        {
          console.log("Error : ",err.stack);
        }
        else
        {
          products = pro.rows;
        }

        res.render("home-customer.ejs",
          {
              products: products
          }
        )
})

app.get("/orderdetails",async (req,res)=>{
  const temp_id = await db.query("Select id from customer where name = $1",[name]);
  const cid = temp_id.rows[0].id;

    const resul = await db.query("Select * from odetails where cid = $1",[cid]);
    if(resul.rows.length > 0)
    {
        res.render("order-details.ejs",{
          products : resul.rows
        })
    }
    else
    {
      res.render("order-details.ejs",{
        products : []
      })
    }
})

app.listen(port,()=>{
    console.log(`Server Running on Port ${port}`);
})