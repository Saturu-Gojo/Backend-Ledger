const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        fromAccount: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true, "from Account is required for transaction"],
        index: true,
    },
    toAccount:{
        toAccount: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, "To Account is required for transaction"],
        index:true
    },
    status:{
        type: String,

        enum :{
            values : ["PENDING","COMPLETED", "FAILED", "PENDING"],
            message: "Status can be either PENDING, COMPLETED, FAILED, or REVERSED",
        },
        default: "PENDING"
    },
    amount:{
        type: Number,
        required: [true, "Amount is required to be filled"],
        min: [0, "Transaction amount can't be negative"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency Key is required"],
        index:true,
        unique:true
    }
},{
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel