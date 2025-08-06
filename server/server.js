var express= require("express");
var cors=require('cors');
var app=express();
var fileuploader=require("express-fileupload");
var mysql2=require("mysql2");
var cloudinary=require("cloudinary").v2;


let config="mysql://avnadmin:AVNS_8p1dW-dFtL8yZd0i-ZA@mysql-177f9110-purvikabansal05-ae65.k.aivencloud.com:11245/defaultdb?";
let mysqlserver=mysql2.createConnection(config);
mysqlserver.connect(function(err)
{
    if(err==null)
        console.log("Connected to given database server");
    else
    console.log(err.message);
});
cloudinary.config({ 
    cloud_name: 'dvdq3rbug',
    api_key: '838633579214926', 
    api_secret: 'bMjM8exk7u1mWeE1z5IwVljelbE' // Click 'View API Keys' above to copy your API secret
});
app.use(fileuploader());
app.use(express.urlencoded(true));
app.use(express.json()); // For parsing JSON bodies

// app.use(cors({ origin: 'https://pulseforge.onrender.com' })); //means ye website hi mera backend acces kr skti hai not any another website
app.use(cors({
    origin: 'https://pulseforge.onrender.com',
    methods: ['GET', 'POST']  // only allow GET and POST requests
  })); //means ye website hi mera backend acces kr skti hai not any another website
  

app.use(express.static(path.join(__dirname, 'public')));
//but due to this line i was not able to open any other html file(only the index.html was opening agian and agian) through the serveer therefore i commented this line

app.get("/",function(req,resp){
    let path=__dirname+"/public/index.html";
    resp.sendFile(path);
 })
 app.get("/dashboardorganiser",function(req,resp){
    let path=__dirname+"/public/dashorganiser.html";
    resp.sendFile(path);
 })
 app.get("/profileorganiser",function(req,resp){
    let path=__dirname+"/public/profileorganiser.html";
    resp.sendFile(path);
 })
 app.get("/publishtournament",function(req,resp){
    let path=__dirname+"/public/publishtournament.html";
    resp.sendFile(path);
 })
 app.get("/tournamentfinder",function(req,resp){
    let path=__dirname+"/public/tournamentfinder.html";
    resp.sendFile(path);
 })

 app.post("/signup-process-secure",function(req, resp) {
    mysqlserver.query(
        "INSERT INTO users (emailid, pwd, utype, dos, status) VALUES (?, ?, ?, CURDATE(), ?)", 
        [req.body.txtEmail, req.body.txtPwd, req.body.utype, 1], 
        function (err) {
            if (err == null) {      
                resp.send("Record saved successfully");
            } else {
                resp.send(err.message);
            }
        }
    );
});
//--------------------------------------------------------------------
app.post("/profile-organiser",async function(req,resp)
{
   let sports=req.body.selectedsports.toString();
   

let filename="";
if(req.files==null)
{
    filename="nopic.jpg";
}
else
{
    filename=req.files.picupload.name;
    let path=__dirname+"/public/uploads/"+filename;
   console.log(path);
    req.files.picupload.mv(path);
    //saving file on cloudinary server
    await cloudinary.uploader.upload(path).then(function(result){
        filename=result.url;  //will give u the url of ur pic on cloudinary server
        console.log(filename);
    });
}
req.body.picupload=filename;
mysqlserver.query("insert into organisations values(?,?,?,?,?,?,?,?,?,?,?)",[req.body.txtemail,req.body.txtorganisation,req.body.txtcontact,req.body.txtaddress,req.body.txtcity,req.body.proof,req.body.picupload,sports,req.body.txtprev,req.body.txtwebsite,req.body.txtmedia],function(err)
{
   if(err==null)
    resp.send("record saved succesfully");
    else
    resp.send(err.message);
})
//resp.send(req.body);
})
//-----------------Profile Player-----------------------------------
app.post("/profile-player",async function(req,resp)
{
let filename="";
if(req.files==null)
{
    filename="nopic.jpg";
}
else
{
    filename=req.files.picupload.name;
    let path=__dirname+"/public/uploads/"+filename;
   console.log(path);
    req.files.picupload.mv(path);
    //saving file on cloudinary server
    await cloudinary.uploader.upload(path).then(function(result){
        filename=result.url;  //will give u the url of ur pic on cloudinary server
        console.log(filename);
    });
}
req.body.picupload=filename;
mysqlserver.query("insert into players values(?,?,?,?,?,?,?,?,?,?,?)",[req.body.txtemail,req.body.txtname,req.body.txtgender,req.body.txtdate,req.body.txtcontact,req.body.txtaddress,req.body.txtcity,req.body.proof,req.body.picupload,req.body.txtsports,req.body.txtachievements],function(err)
{
   if(err==null)
    resp.send("record saved succesfully");
    else
    resp.send(err.message);
})
//resp.send(req.body);
})
//----------------------update the player details---------------
app.post("/update-player", async function (req, resp) {
    let filename = "";
    if (req.files == null) {
        filename = "nopic.jpg";
    } else {
        filename = req.files.picupload.name;
        let path = __dirname + "/public/uploads/" + filename;
        console.log(path);
        req.files.picupload.mv(path);
        // Saving file on Cloudinary server
        await cloudinary.uploader.upload(path).then(function (result) {
            filename = result.url; // Get URL of pic on Cloudinary
            console.log(filename);
        });
    }
    req.body.picupload = filename;

    mysqlserver.query(
        "UPDATE players SET name=?, gender=?, dob=?, contact=?, address=?, city=?, proof=?, pic=?, sports=?, achievements=? WHERE emailid=?",
        [
            req.body.txtname,
            req.body.txtgender,
            req.body.txtdate,
            req.body.txtcontact,
            req.body.txtaddress,
            req.body.txtcity,
            req.body.proof,
            req.body.picupload,
            req.body.txtsports,
            req.body.txtachievements,
            req.body.txtemail, // WHERE clause
        ],
        function (err) {
            if (err == null) resp.send("Record updated successfully");
            else resp.send(err.message);
        }
    );
});

//------------------Fetch Cities-------------------------------------
app.get("/fetch-all-cities",function(req,resp)
{
    
    mysqlserver.query("select distinct city from tournaments",function(err,jsonArrayC)
    {
        
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
       
                resp.send(jsonArrayC);
           
    })
})
//---------------Fetch games---------------------------------------
app.get("/fetch-all-games",function(req,resp)
{
    
    mysqlserver.query("select distinct game from tournaments",function(err,jsonArrayG)
    {
        
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
       
                resp.send(jsonArrayG);
           
    })
})
//---------------Publish Tournament------------------------------------
app.post("/publish-tournament", async function(req, resp) {
    if (!req.files || !req.files.picupload) {
        return resp.status(400).send("No file uploaded");
    }

    let file = req.files.picupload;
    let path = __dirname + "/public/uploads/" + file.name;

    file.mv(path, async function(err) {
        if (err) {
            console.log("Error moving file:", err);
            return resp.status(500).send("Error while moving file to server.");
        }

        // Upload to Cloudinary
        try {
            const result = await cloudinary.uploader.upload(path);
            let cloudinaryUrl = result.secure_url; // Always use `secure_url`
            console.log("Uploaded to Cloudinary:", cloudinaryUrl);

            // Insert into database after Cloudinary upload
            mysqlserver.query("INSERT INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                null, req.body.txtemail, req.body.txtgame, req.body.txttitle, 
                req.body.txtcity, req.body.txtlocation, cloudinaryUrl, 
                req.body.txtfee, req.body.txtdate, req.body.txtprizes, req.body.txtinfo
            ], function(err) {
                if (err) resp.send("Error while saving the record: " + err.message);
                else resp.send("Record saved successfully");
            });

        } catch (cloudinaryErr) {
            console.log("Cloudinary upload error:", cloudinaryErr);
            return resp.status(500).send("Error uploading to Cloudinary.");
        }
    });
});


//----------------------Fetch all tournaments from table tournaments to home page of website
app.get("/fetch-all-tournaments",function(req,resp)
{    
    city = req.query.city;
    game = req.query.game;
    mysqlserver.query("select * from tournaments where city=? and game=?",[city,game],function(err,jsonArray)
    {
        if(err!=null)
            resp.send(err.message);
        else
        resp.send(jsonArray);
    })
})
//---------------------------------------------------------------------
app.get("/check-user",function(req,resp)
{
    let email=req.query.txtmail;
    mysqlserver.query("select * from users where emailid=?",[email],function(err,jsonArray)
    {
        //resp.send(jsonArray);
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
        if(jsonArray.length==1)
            {const utype = jsonArray[0].utype;
                resp.send(utype);
            } 
            else
                resp.send("Email Not Found");
    })


})
//------------------fetch-user-----------------
app.get("/fetch-user",function(req,resp)
{
    let email=req.query.txtemail;
    mysqlserver.query("select * from players where emailid=?",[email],function(err,jsonArray)
    {
        //resp.send(jsonArray);
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
        {
            if(jsonArray.length == 0) {
                resp.send({ message: "No player found with this email" });
            } else {
                resp.send(jsonArray);
            }
            }    //can send 0 and 1 if 1 means email is there if 0 matlab email not exist array will be empty
    })


})
//------------------api to update password----------
app.get("/update-password", function(req,resp)
    {
       let email=req.query.txtmail;
       let oldpass=req.query.txtop;
       let newpass=req.query.txtnp;
       mysqlserver.query("update users set pwd=? where emailid=? and pwd=?",[newpass,email,oldpass],function(err,result)
    {
        console.log(result.affectedRows)

        if(err!=null)
        {
            resp.send(err.message);
        }
        else if(result.affectedRows==1)
        {
            resp.send("password updated successfully");
        }
        else
        {
            resp.send("Invalid Passowrd entered or password is same");
        }
    })
 })
 app.listen(process.env.PORT || 2005, function() {
    console.log("Server Started");
});
