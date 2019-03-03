var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

var transactionSchema = new mongoose.Schema({
    info : {
        type : String,
        required : true
    }
});

module.exports = mongoose.model('Transaction',transactionSchema);