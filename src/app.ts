import express from "express";
import mongoose, {Document,Schema,model} from "mongoose";
const app = express();
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req,res,next)=>{
  res.setHeader("Content-Type","application/json")
  next();
})


app.listen(8080,()=>console.log("listening to 8080"));


const url = "mongodb://localhost:27017/booky";

mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology: true },(err:any)=>{
  if(err) throw err;
});

const db = mongoose.connection;

db.once('open', () => {
  console.log("we are connected!")
});

interface IBook extends Document {
  name:string,
  author:string
}
type BookReq = {
  name:string,
  author:string
}
const bookSchema = new Schema({
  name:{type:String,required:true},
  author:{type:String,required:true}
});

const Book =  model<IBook>("Book", bookSchema)

app.post("/books/create",(req,res)=>{
  console.log(req.body);
  const newBookReq :BookReq = req.body as BookReq;
  const newBook = new Book({
    name:newBookReq.name,
    author:newBookReq.author
  })
  newBook.save().then((r)=>{
    console.log(`Book with name ${r.name} created successfuly`);
    res.status(201).end();
  }).catch((err)=>{
    console.log(err)
    res.status(500).end()
  })
});

app.put("/books/:bookId/update",(req,res)=>{
  console.log(req.body);
  const toUpdateBookReq :BookReq = req.body as BookReq;
  const {bookId} = req.params;
  const toUpdateBook =  Book.findById(bookId);

   toUpdateBook.update({author:toUpdateBookReq.author,name:toUpdateBookReq.name}).then((r)=>{
    console.log(`Book with name ${r.name} has updated successfuly`);
    res.status(201).end();
  }).catch((err)=>{
    console.log(err)
    res.status(500).end()
  })
});

app.delete("/books/:bookId",(req,res)=>{
  const {bookId} = req.params;
  const toUpdateBook =  Book.findByIdAndDelete(bookId).then((r)=>{
    console.log(`Book with name ${r.name} has deleted successfuly`);
    res.status(201).end();
  }).catch((err)=>{
    console.log(err)
    res.status(500).end()
  })
})

app.get("/books",(req,res)=>{
  Book.find((err,books)=>{
    const jsonBooks = JSON.stringify(books);
    res.status(200).end(jsonBooks);
  });
})

app.get("/healthcheck",(req,res)=>{
  res.send("healthy")
})
