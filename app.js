const express=require("express");
const app=express();
const ejs=require("ejs")
const path=require("path");
const port=3000;
const mongoose=require("mongoose");
const Student=require("./models/student");
const datas=require("./init/data");
const methodOverride = require('method-override');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const localstratergy=require("passport-local");
const User=require("./models/user");
const ejsmate=require("ejs-mate");
const {isloggedin}=require("./middleware.js");
mongoose.connect('mongodb://127.0.0.1:27017/hostel')
.then(() => console.log('Connected!'));

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static("public"));
app.engine("ejs",ejsmate);
const sessionOption={
    secret:"mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expire:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localstratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curruser=req.user;
    next();
})

app.get("/",(req,res)=>{
    res.render("listings/home.ejs");
})


const PDFDocument = require("pdfkit");

app.get("/listings/:id/receipt", async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById(id);

  if (!student || student.feeStatus !== "Paid") {
    return res.send("Receipt not available");
  }

  
//pdftoolkit

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${student.name}.pdf`
  );
  doc.pipe(res);
  doc.fontSize(20).text("Hostel Fee Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Name: ${student.name}`);
  doc.text(`Email: ${student.email}`);
  doc.text(`Room No: ${student.roomNo}`);
  doc.text(`Course: ${student.course}`);
  doc.text(`Branch: ${student.branch}`);
  doc.text(`Status: ${student.feeStatus}`);
  doc.moveDown();
  doc.text("Payment Successful ✅", { align: "center" });
  doc.end();
});


app.get("/listings", async (req, res) => {
    const { search, branch } = req.query;
    let query = {};
    if (search) {
        query.name = { $regex: search, $options: "i" };
    }
    if (branch && branch !== "all") {
        query.branch = branch;
    }
    const results = await Student.find(query);
    res.render("listings/index", { results });
});

app.get("/listings/pricing",(req,res)=>{
    res.render("listings/pricing");
});

app.get("/listings/:id",async(req,res)=>{
    let{id}=req.params;
    let result=await Student.findById(id);
    res.render("listings/show.ejs",{result});
})

app.get("/add",(req,res)=>{
     res.render("listings/new.ejs");
})
app.get("/price",(req,res)=>{
    res.render("listings/price.ejs");
})

app.post("/listings", async (req, res) => {
    try {
        let {
            name,email,phone,parentMobile,address,roomNo,course,branch,fine,feeStatus,image } = req.body;
            if(!fine){
                fine=0;
            }
        const newStudent = new Student({
            name,email,phone, parentMobile, address, roomNo, course, branch, fine,feeStatus,image
        });
      let re= await newStudent.save();
      console.log(re);
      req.flash("success","Student add successfully");
        res.redirect("/listings");
    } catch (err) {
        req.flash("error","Student not added please try again")
        res.send("Error saving data");
    }
});
app.get("/listings/:id/edit",async(req,res)=>{
    let{id}=req.params;
    let result=await Student.findById(id);
    res.render("listings/edit.ejs",{result});
})

app.patch("/listings/:id", async (req, res) => {
    try {
        let { id } = req.params;
        let { name, email, phone, parentMobile, address, roomNo, course, branch, fine, feeStatus, image } = req.body;
        await Student.findByIdAndUpdate(id, {
            name,
            email,
            phone,
            parentMobile,
            address,
            roomNo,
            course,
            branch,
            fine,
            feeStatus,
            image
        });
        req.flash("success","Student Update successfully")
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
    }
});

app.delete("/listings/:id",async(req,res)=>{
    let{id}=req.params;
    await Student.findByIdAndDelete(id);
    console.log("student delete");
    req.flash("success","Student remove successfully");
    res.redirect("/listings");
})


//login and logout
app.get("/signup",(req,res)=>{
    res.render("user/signup.ejs")
})
app.get("/login",(req,res)=>{
    res.render("user/login.ejs")
})

app.post("/signup", async (req, res, next) => {
  try {
    let { username, password, email } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Admin Registered Successfully!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
});


app.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),(req,res)=>{
    req.flash("success","Welcome to Shiksha Sadan Hostel Website");
    res.redirect("/listings");
})



app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You Logout successfully")
        res.redirect("/listings");
    })
})

app.use((req,res,next)=>{
    res.render("listings/error.ejs");
    next();
})


app.listen(port,(req,res)=>{
    console.log("Server is running on port "+port);
})

// const initdb=async()=>{
//     await Student.insertMany(datas);
//     console.log("data inserted successfully");
// }