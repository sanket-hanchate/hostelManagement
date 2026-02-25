module.exports.isloggedin=(req,res,next)=>{
  // console.log(req.originalUrl);
     if(!req.isAuthenticated()){
      // req.session.url=req.originalUrl;
        req.flash("error","you must be login")
        return res.redirect("/login");
    }
      next();
}
