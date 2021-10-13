const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productoSquema = new Schema({
    tipoProducto : {type:String},
    modelo:{type:String},
    referencia: {type:String},
    fechaCompra:{type:Date},
    estado:{type:String},
    valorCompra:{type:Number},
    valorVenta:{type:Number},
    entregado:{type:Boolean, default:false},
    proveedor:{type:String}
});
module.exports = mongoose.model('product',productoSquema);