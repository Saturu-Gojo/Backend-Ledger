const dns = require('dns');

// Force Node.js to use Google DNS for all lookups in this process
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose')

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Database Connected")
    })
    .catch((err)=>{
        console.log("Error Occured",err)
        process.exit(1)
    })
}

module.exports = connectToDB