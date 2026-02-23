const express=require("express");
const app=express();
const ejs=require("ejs")
const path=require("path");
const port=3000;
const mongoose=require("mongoose");
const Student=require("./models/student");
const datas=require("./init/data");
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
const ejsmate=require("ejs-mate");
mongoose.connect('mongodb://127.0.0.1:27017/hostel')
.then(() => console.log('Connected!'));

app.use(express.urlencoded({ extended: true }));
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.engine("ejs",ejsmate);

app.get("/",(req,res)=>{
    res.render("listings/home.ejs");
})
app.get("/listings",async(req,res)=>{
    let results=await Student.find({});
    res.render("listings/index.ejs",{results});
})

app.get("/listings/:id",async(req,res)=>{
    let{id}=req.params;
    let result=await Student.findById(id);
    res.render("listings/show.ejs",{result});
})

app.get("/add",(req,res)=>{
     res.render("listings/new.ejs");
})

app.post("/listings", async (req, res) => {
    try {
        let {
            name,email,phone,parentMobile,address,roomNo,course,branch,fine,feeStatus,image } = req.body;

        const newStudent = new Student({
            name,email,phone, parentMobile, address, roomNo, course, branch, fine,feeStatus,image
        });
      let re= await newStudent.save();
      console.log(re);
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        res.send("Error saving data");
    }
});
app.get("/listings/:id/edit",async(req,res)=>{
    let{id}=req.params;
    let result=await Student.find({});
    res.render("listings/edit.ejs",{result});
})

app.use((req,res,next)=>{
    res.send("404 page not found");
})

app.listen(port,(req,res)=>{
    console.log("Server is running on port "+port);
})

// const initdb=async()=>{
//     await Student.insertMany(datas);
//     console.log("data inserted successfully");
// }
