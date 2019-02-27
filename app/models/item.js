var mongoose = require('mongoose');
var titlize = require('mongoose-title-case');
mongoose.set('useCreateIndex', true);

var itemSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    category : {
        type:String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    points : {
        type : Number,
        required : true
    },
    status : {
        type : Boolean,
        default : false
    },
    seller : {
        type : String,
        required : true
    },
    buyer : {
        type : String
    },
    image : {
        type : String,
        required : true
    }
});

// Mongoose title case plugin
itemSchema.plugin(titlize, {
    paths: [ 'name','description','category'], // Array of paths
});

module.exports = mongoose.model('Item',itemSchema);