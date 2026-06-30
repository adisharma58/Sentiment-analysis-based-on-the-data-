const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");


const app = express();

app.use(cors());
app.use(express.json());


// Supabase connection

const supabase = createClient(
    "https://lcxmxxqhaljkpifpkhqq.supabase.co/rest/v1/",
    "sb_publishable_y8fuz8KA4gLDulmtB1OPCw_WdzD_joS"
);



// Test API

app.get("/", (req,res)=>{
    res.send("Backend is working");
});



// Get reviews data

app.get("/reviews", async(req,res)=>{


    const {data,error} = await supabase
    .from("reviews")
    .select("*");


    if(error){
        return res.status(500).json(error);
    }


    res.json(data);


});



app.listen(5000,()=>{

    console.log("Server running on port 5000");

});