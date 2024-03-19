import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import axios from "axios";



const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
    //ssl: true,
  });
  db.connect();


app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.render("form.ejs");
});




app.post("/post",async (req,res)=>{
    let langId;

    //Getting hold of chosen language and assigning langId 
    if(req.body.language==="C++")
    {
       langId='cpp17';
       console.log(langId);
    }
    else if(req.body.language==="java")
    {
        langId='java';
        console.log(langId);
    }
    else if(req.body.language==="javascript(Node.Js)")
    {
        langId='nodejs';
        console.log(langId);
    }
    else if(req.body.language==="python")
    {
        langId='python3';
        console.log(langId);
    }
    
      try {
        
            const options = {
            method: 'POST',
            url: 'https://online-code-compiler.p.rapidapi.com/v1/',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': process.env.API_KEY,
                'X-RapidAPI-Host': 'online-code-compiler.p.rapidapi.com'
            },
            data: {
                language: langId,
                version: 'latest',
                code: req.body.sourceCode,
                input: req.body.stdin,
            }
            };

            try {
                const response = await axios.request(options);
                console.log(response.data.output);
                //sending this output in database with username ,sourcecode , stdin and timestamp
                const username=req.body.username;
                const codelanguage=req.body.language;
                const stdin=req.body.stdin;
                const sourcecode=req.body.sourceCode;
                const timestamp=new Date();
                const stdout=response.data.output;
                await db.query(
                    "INSERT INTO records (username ,language ,stdin, sourcecode, Time, stdout) VALUES ($1, $2,$3,$4,$5,$6) ",
                    [username,codelanguage,stdin,sourcecode,timestamp,stdout]
                  );

                  res.render("form.ejs");
                
            } catch (error) {
                console.error(error);
            }
    
        
      } catch (error) {
        console.log("Error:", error);
      }
  
});



app.get("/display",async (req,res)=>{
  try {
    let output=await db.query("SELECT * FROM records ");
    //output.rows contains all the entries
    res.render("display.ejs",{array:output.rows});
    console.log(output.rows);
  } catch (error) {
    console.log(error);
  }


})
app.listen(port,()=>{
    console.log(`server listening at port ${port}`);
})
//module.exports=app;
export default app;