var mongoose = require('mongoose');
var titlize = require('mongoose-title-case');
mongoose.set('useCreateIndex', true);

var subjectSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    professorname : {
        type: String,
        required: true
    },
    professorusername : {
        type : String,
        required : true
    },
    code : {
        type : String,
        unique: true,
        required : true
    },
    students : [{
        name : {
            type : String
        },
        email : {
            type : String
        },
        points : {
            type : Number
        },
        rollnumber : {
            type : Number
        }
    }]
});

// Mongoose title case plugin
subjectSchema.plugin(titlize, {
    paths: [ 'name' , 'professor'], // Array of paths
});

module.exports = mongoose.model('Subject',subjectSchema);