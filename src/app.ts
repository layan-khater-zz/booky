import express from "express";
import mongoose from "mongoose";
const app = express();
const url = "mongodb://localhost:4040/booky";
mongoose.connect(url,{},(err:any)=>{
  if(err) throw err;
});

app.listen(8080,()=>console.log("listening to 8080"));

app.get("/",(req,res)=>{
  res.send("Hi express")

})