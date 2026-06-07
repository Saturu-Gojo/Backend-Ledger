const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: [true, "Account must be associated with a user"],
        index: true
    },
    status:{
        type:String,
        enum:{
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either Actice FROZEN CLOSED",

        },
        default:"ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is require for creating an account"],
        default: "INR"
    }
},
    {
        timestamps:true
    
})

accountSchema.index({user:1, status:1})//compund index

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel