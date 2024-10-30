import express from "express"
import bodyParser from "body-parser";
import pg from "pg"

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();  
const port = 3000;

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

  const name = req.body["username"];
  const password = req.body["password"];

  const resul = await db.query("Select password from customer where name = $1",[name]);

  if(resul.rows.length > 0)
  {
    const user = resul.rows[0];
    const dbpass = user.password;

    if(dbpass === password)
    {
      res.send("<h1>Welcome to Customer HomePage</h1>");
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

  const name = req.body["username"];
  const password = req.body["password"];

  const resul = await db.query("Select password from seller where name = $1",[name]);

  if(resul.rows.length > 0)
  {
    const user = resul.rows[0];
    const dbpass = user.password;

    if(dbpass === password)
    {
      res.send("<h1>Welcome to Seller HomePage</h1>");
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

  const name = req.body["username"];
  const password = req.body["password"];
  const age = req.body["age"];
  const phone_no = req.body["phone_no"];

  await db.query("Insert Into customer(name,password,age,phone_no) Values ($1,$2,$3,$4)",[name,password,age,phone_no]);
  res.sendFile(__dirname + "/public/login-customer.html");
})

app.post("/register-seller",async (req,res)=>{

  const name = req.body["username"];
  const password = req.body["password"];
  const age = req.body["age"];
  const phone_no = req.body["phone_no"];

  await db.query("Insert Into seller(name,password,age,phone_no) Values ($1,$2,$3,$4)",[name,password,age,phone_no]);
  
  db.end();
  
  res.sendFile(__dirname + "/public/login-seller.html");
})

app.listen(port,()=>{
    console.log(`Server Running on Port ${port}`);
})