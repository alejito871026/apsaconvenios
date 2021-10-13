const express = require('express');
const router = express.Router();
const Creditos = require('../models/Creditos');
const infoLaborall = require('../models/infoLaboral');
const referidoss = require('../models/referidos');
const Pagares = require('../models/pagares');
const fiador = require('../models/fiador');
const prenda = require('../models/prenda');
const empleadosCreditos = require('../models/empleadosCreditos');
const Cliente = require('../models/Clientes.js');
const authe = require('../middlewareServer/authenticacion.js');
const valoresCredito = require('../models/valoresEstadoCredito.js');
const Ingresos = require('../models/Ingresos');

router.post('/creditosApagar',authe, async (req, res)=>{
    let start = new Date(req.body.funo)
    let end = new Date(req.body.fdos)
    var credito= await Creditos.find({"estado":"activo","estadoInterno":"Entregado", "Fp":{"$gte" : start,"$lte" : end}}).sort({Fp:1}).populate('cliente')
    res.json(credito)
})
router.post('/verValoresCredito',authe, async (req, res)=>{
    var x =(req.body._id)
    var valores = await valoresCredito.find({id:x})
    res.json(valores)
})
router.post('/actualizarMora', authe, async (req, res)=>{
    let fecha = new Date();
    try {
        const creditosActivos = await Creditos.find({estado:"activo", estadoInterno:"Entregado"})
        for(let i = 0; i < creditosActivos.length; i++){
            if(fecha>creditosActivos[i].Fp){
                await Creditos.updateOne({_id: creditosActivos[i]._id},{$set:{enMora:true}})
            }
        }
        res.status(200).json({success:true})
    } catch (error) {
        res.status(205).json({success:true,error})
    }
    
})
router.post('/cambiarPagares', authe, async (req, res)=>{
    console.log(req.body)
    try {
       const agregadas = await Pagares.findById(req.body._id)
        console.log(agregadas.agregadas)
        if(agregadas.agregadas<2){
            let total = agregadas.agregadas + 1
            const ok = await Pagares.updateOne({_id:req.body._id},{
                $set:{
                    pagares:req.body.pagares,
                    agregadas:total
            }}) 
            console.log(ok)
            if(ok.ok===1){
                const nuevaFecha = await Creditos.updateOne({_id:req.body.idCredito},{$set:{Fp:req.body.fp}})
                console.log(nuevaFecha)                
                //aca ingresamos el valor del interes de la cuota a la caja
                let valores =  {
                    nombre : req.body.nombre,
                    numeroCredito : req.body.numeroCredito,
                    descripcion : 'ingreso interes de la cuota # '+(req.body.index+1)+' Del credito # '+req.body.numeroCredito+' la cual se pago mediante la opcion de crear nueva cuota',
                    concepto : 'cuota credito al final',
                    interes : req.body.interes,
                    capital : 0,
                    idCredito : req.body.idCredito,
                    fechaIngresoEfectivo : req.body.fechaIngresoEfectivo,
                    codigoEmpleado : req.body.codigoEmpleado,
                }
                const ingresos = new Ingresos(valores)
                await ingresos.save()
                res.status(200).json({success:true})                 
            }else{
                res.status(205).json({
                    success:false,
                    msg:'Error al actualizar los pagares'
                })
            }
        }else{
            res.json({
                success:false,
                msg:'Ya as agotado las dos posibilidades posibles para pasar cuptas al final'
            })
        }
    }catch (error) {
        console.log(error)
        res.json({
            success:false,
            msg:'Ocurrio un error',
            error
        })
    }
    
        
    
})
router.post('/contarCreditos', async (req, res) => {
    const cantidad = await Creditos.countDocuments()
    res.status(200).json({ 
        cantidad
    })
})
router.post('/guardarCredito', async (req, res) => {
    console.log(req.body)
    let credito = {} 
    credito.cliente = req.body.cliente 
    credito.servicio = req.body.credito.servicio
    //falta guardar los creditos de productos
    credito.cantidad = req.body.credito.cantidad
    credito.interes = req.body.credito.interes
    credito.cuotaInicial = req.body.credito.inicial
    credito.tiempo = req.body.credito.tiempo
    credito.frecuencia = req.body.credito.frecuencia
    credito.aumentoPorDias = req.body.credito.aumentoPorDias
    credito.interesMensual = req.body.valores.interesMensual
    credito.nombreCliente = req.body.nombreCliente
    credito.cedulaCliente = req.body.cedulaCliente
    let pagos = await guardarPagares(req.body.valores.pagares)
    console.log('pagos')
    console.log(pagos)
    credito.pagares = pagos._id
    credito.valTotalCred = req.body.valores.valorTotalCredito
    credito.valCuotaMens = req.body.valores.valorCuota
    credito.fechaAgregado = new Date()
    if(req.body.fiador){ 
        let fiador = await guardarFiador(1,req.body.fiador)
        credito.fiador = fiador._id
    } 
    if(req.body.prenda){
        let prenda = await guardarFiador(2,req.body.prenda)
        credito.prenda = prenda._id
    }
    let infoLab = await guardarInfoLaboral(req.body.infoLab)
    credito.infoLab = infoLab._id
    let Referidos = await guardarReferidos(req.body.referidos)
    credito.referidos = Referidos._id
    credito.Fp = pagos.Fp
    let empleado = await guardarEmpleadoCreador(req.body.credito.creadoPor)
    credito.empleados = empleado._id
    credito.valorTotal = req.body.valores.valorTotalCredito
    credito.numeroCredito = await numeroCredito()
    console.log(credito)
    let guardado = new Creditos(credito)
    const ok = await guardado.save()
    console.log(ok)
    res.status(200).json({
        success:true
    })
})
router.post('/guardarRenovacion', async (req, res) => {
    try {
        let empleado = await guardarEmpleadoCreador(req.body.creadoPor)
        let pagos = await guardarPagares(req.body.pagares)
        let guardado = new Creditos(req.body)
        guardado.pagares = pagos._id
        guardado.empleados = empleado._id
        guardado.numeroCredito = await numeroCredito()
        console.log(guardado)
        const ok = await guardado.save()
        console.log(ok)
        const updateCredito = await Creditos.updateOne({_id:req.body.OldValores.id},{$set:{renovacion:true}})
        if(empleado&&pagos&&ok&&updateCredito){
            res.status(200).json({
                success:true
            })
        }        
    } catch (error) {
        console.log(error)
        res.status(200).json({
            success:false,
            error
        })
    }
    
})
router.post('/pagarCreditoAnterior',authe, async (req, res)=>{
    console.log(req.body)
    try {
        let pagares = await Pagares.findById(req.body.pagaresId)
        for(let a = 0; a < pagares.pagares.length; a++){
            if(!pagares.pagares[a].estado){
                console.log(pagares.pagares[a])
                pagares.pagares[a].dias = 0
                pagares.pagares[a].diasFavor = 0
                pagares.pagares[a].diasContra = 0
                pagares.pagares[a].estado = true
                pagares.pagares[a].fechaPago =  req.body.fechaIngresoEfectivo
                pagares.pagares[a].observacion = 'se pago mediante renovacion'
            }
            if(a===pagares.pagares.length-1){
                let pagaresUpdate = await Pagares.updateOne({_id:req.body.pagaresId},{$set:{pagares:pagares.pagares}})
                console.log(pagaresUpdate)       
            }
        } 
        let credito = await Creditos.updateOne({_id:req.body.id},{$set:{estado:'terminado',estadoInterno:'terminado'}})
        let valores = await valoresCredito.findByIdAndDelete(req.body._id)      
        let datos =  {
            nombre : req.body.nombreCliente,
            numeroCredito : req.body.numeroC,
            descripcion : 'Ingreso a capital del credito # '+req.body.numeroC+' El cual se cancelo por renovacion',
            concepto : 'Renovacion',
            interes : req.body.interes,
            capital : req.body.capital,
            idCredito : req.body.id,
            fechaIngresoEfectivo : req.body.fechaIngresoEfectivo,
            codigoEmpleado : req.body.codigoEmpleado,
        }
        let ingreso = new Ingresos(datos)
        let ingresoOk = await ingreso.save()
        console.log(ingresoOk)
        if(pagaresUpdate&&credito&&valores&&ingresoOk){
            res.json({success:true})
        }
    } catch (error) {
        res.json({success:false,error})
    }
})
router.get('/entregadosActivos',authe, async (req, res) => {
    var creditos = await Creditos.find({"estadoInterno":"Entregado","estado":"activo"}).populate('pagares').populate('cliente')
    res.json(creditos)
})
router.get('/valoresCreditos',authe, async (req, res) => {
    var creditos = await valoresCredito.find()
    res.json(creditos)
})
router.post('/creditosCliente',authe, async (req, res)=>{
    var x =(req.body.cedulaId)
    var credito= await Creditos.find({"cedulaCliente":x, "estado":"activo"}).populate('pagares')
    res.json(credito)
})
router.post('/creditosClienteTerminados',authe, async (req, res)=>{
    var x =(req.body.cedulaId)
    var credito= await Creditos.find({cedulaCliente:x, estado:"terminado" ,estadoInterno: 'terminado'}).populate('pagares')
    res.json(credito)
})
router.get('/solicitudes', authe, async (req, res)=>{
    const solicitudes = await Creditos.find({estado:"activo", estadoInterno:"cotizacion"}).populate('cliente')
    res.json(solicitudes)
})
router.get('/rechazos', authe, async (req, res)=>{
    const solicitudes = await Creditos.find({estado:"activo", estadoInterno:"No aprobado"}).populate('cliente')
    res.json(solicitudes)
})
router.get('/terminados', authe, async (req, res)=>{
    const terminados = await Creditos.find({estado:"terminado", estadoInterno:"terminado"}).populate('cliente')
    res.json(terminados)
})
router.get('/primeraInstancia', authe, async (req, res)=>{
    const solicitudes = await Creditos.find({estado:"activo", estadoInterno:"primeraEstancia"}).populate('cliente').populate('infoLab').populate('referidos').populate('fiador').populate('prenda')
    res.json(solicitudes)
})
router.get('/aprobados', authe, async (req, res)=>{
    const solicitudes = await Creditos.find({estado:"activo", estadoInterno:"Aprobado"}).populate('cliente').populate('pagares')
    res.json(solicitudes)
})
router.post('/solicitudUnica', authe, async (req, res)=>{
    const solicitudes = await Creditos.findById(req.body._id).populate('cliente').populate('referidos')
    .populate('infoLab').populate('prenda').populate('fiador')
    res.json(solicitudes)
})
router.post('/creditoAnterior', authe, async (req, res)=>{
    const credito = await Creditos.findById(req.body._id).populate('cliente').populate('referidos')
    .populate('infoLab').populate('prenda').populate('fiador')
    res.json(credito)
})
router.post('/actualizarReferencias', authe, async (req, res)=>{
    console.log(req.body._id)
    const ok = await referidoss.updateOne({_id:req.body._id},{
        $set:{
            referidos:req.body.referidos,
            validados:req.body.validados
    }})
    console.log(ok)
    if(ok.ok===1){
        res.status(200).json({success:true})
    }else{
        res.status(205).json({success:false})
    }
})
router.post('/guardarInfoCliente', authe, async (req, res)=>{
    const infoOk = await infoLaborall.updateOne({_id:req.body.id},{$set:{informacionCliente:req.body.informacionCliente,validadoInfoCliente:req.body.validadoInfoCliente}})
    res.status(200).json({data:infoOk._id,success:true})
})
router.post('/guardarInfoLabCliente', authe, async (req, res)=>{
    const infoOk = await infoLaborall.updateOne({_id:req.body.id},{$set:{informacionLaboralCliente:req.body.informacionLaboralCliente,validadoInfoLaboral:req.body.validadoInfoLaboral}})
    res.status(200).json({data:infoOk._id,success:true})
})
router.post('/guardarInfoFiador', authe, async (req, res)=>{
    const infoOk = await fiador.updateOne({_id:req.body.id},{$set:{infoFiador:req.body.infoFiador,validadoInfoFiador:req.body.validadoInfoFiador}})
    res.status(200).json({data:infoOk._id,success:true})
})
router.post('/cambiarEstadoInterno', authe, async (req, res)=>{
    if(req.body.fechaEntregado){
        const infoOk = await Creditos.updateOne({_id:req.body.id},{$set:{estadoInterno:req.body.estadoInterno,fechaEntregado:req.body.fechaEntregado}})
        res.status(200).json({data:infoOk._id,success:true})
    }else{
        const infoOk = await Creditos.updateOne({_id:req.body.id},{$set:{estadoInterno:req.body.estadoInterno}})
        res.status(200).json({data:infoOk._id,success:true})
    }
})
router.post('/marcarInformado',authe, async (req, res)=>{
    Creditos.updateOne({"_id": req.body.id },{
        $set: { "clienteInformado": true,}},(err, ok)=>{
            if(err){
                return res.status(400).json({
                    title: 'error',
                    error: 'error al actualizar informacion del cliente'
                })
            }else{
                return res.status(200).json({
                    data: ok,
                    success:true
                })
            }
        })
})
router.post('/recibidaInicial',authe, async (req, res)=>{
    Creditos.updateOne({"_id": req.body.id },{
        $set: { "cuotaInicialEntregada": true,}},(err, ok)=>{
            if(err){
                return res.status(400).json({
                    title: 'error',
                    error: 'error al actualizar informacion del cliente'
                })
            }else{
                return res.status(200).json({
                    data: ok,
                    success:true
                })
            }
        })
})
router.post('/guardarEstado', authe, async(req,res)=>{
    const valoresCredi = new valoresCredito (req.body);
    valoresCredi.save( (err, credit) => {
        if(err){
            return res.status(400).json({
                title: 'error',
                error: 'error al guardar prenda'
            })
        }else{
            return res.status(200).json({
                data: 'valores gurdados con exito',
                success:true,
            })
        }
    });
})
router.post('/nombreYcedula', authe, async(req,res)=>{
    const creditos = await Creditos.find()
    for (let a = 0; a < creditos.length; a++) {
        const idCliente = creditos[a].cliente;
        let cliente = await Cliente.findById(idCliente);
        let nombreCliente = cliente.nombreCliente+' '+cliente.primerApellidoCliente+' '+cliente.segundoApellidoCliente;
        let cedulaCliente = cliente.cedulaIdCliente
        const okNombreYcedula = await Creditos.updateOne({_id:creditos[a]._id},{$set:{nombreCliente,cedulaCliente}})
        console.log(okNombreYcedula)        
    }
    res.status(200).json({success:true})
})
router.post('/creditosClienteActivosNombre', authe, async (req, res)=>{
    const aprobadosCliente = await Creditos.find({nombreCliente: {  $regex :  req.body.nombre , $options:'i'},estado:"activo",estadoInterno:"Entregado"}).populate('cliente')
    res.json(aprobadosCliente)
})
router.post('/creditosClienteActivosCedula', authe, async (req, res)=>{
    var aprobadosCliente = await Creditos.find({cedulaCliente: {  $regex :  req.body.cedula , $options:'i'},estado:"activo",estadoInterno:"Entregado"}).populate('cliente')
    res.json(aprobadosCliente)
})
router.post('/creditosClienteTerminadosNombre', authe, async (req, res)=>{
    const aprobadosCliente = await Creditos.find({nombreCliente: {  $regex :  req.body.nombre , $options:'i'},estado:"terminado",estadoInterno:"terminado"}).populate('cliente')
    res.json(aprobadosCliente)
})
router.post('/creditosClienteTerminadosCedula', authe, async (req, res)=>{
    var aprobadosCliente = await Creditos.find({cedulaCliente: {  $regex :  req.body.cedula , $options:'i'},estado:"terminado",estadoInterno:"terminado"}).populate('cliente')
    res.json(aprobadosCliente)
})
router.post('/verCreditoUnico', authe, async (req, res)=>{
    const credito = await Creditos.findById(req.body._id).populate('cliente').populate('pagares')
    res.json(credito)
})
router.post('/verCreditoUnicoRenovacion', authe, async (req, res)=>{
    console.log(req.body)
    const credito = await Creditos.findById(req.body._id).populate('cliente').populate('pagares').populate('referidos').populate('fiador').populate('prenda').populate('infoLab')
    res.json(credito)
})
module.exports = router;
async function guardarReferidos(referidos) {
    let r = {}
    r.referidos = referidos
    let Referidos = new referidoss(r)
    let rr = await Referidos.save()
    let data = {
        _id : rr._id,
        success:true
    }
    return data
}
async function guardarInfoLaboral(info){
        infoLaboral = info
        let i = {infoLaboral}
        let Info = new infoLaborall(i)
        let  r = await Info.save()
        let data = {
            _id : r._id,
            success:true
        }
        return data
}
async function guardarFiador(n,info){
    if(n===1){
        let Info = new fiador(info)
        let  r = await Info.save()
        let data = {
            _id : r._id,
            success:true
        }
        return data
    }
    if(n===2){
        let Info = new prenda(info)
        let  r = await Info.save()
        let data = {
            _id : r._id,
            success:true
        }
        return data
    }
    console.log(n)
    console.log(info)
}
async function guardarPagares(pagares){
    let Pagos = new Pagares({pagares})
    let  r = await Pagos.save()
    console.log(r)
    let data = {
        Fp:r.pagares[0].fecha,
        _id : r._id,
        success:true
    }
    return data
}
async function guardarEmpleadoCreador(creado){
    let creadoPo = {
        creadoPor:creado
    }
    let Info = new empleadosCreditos(creadoPo)
    let r = await Info.save()
    let data = {
        _id : r._id,
        success:true
    }
    return data
}
async function numeroCredito(){
    const cantidad = await Creditos.countDocuments()
    return cantidad + 1
}