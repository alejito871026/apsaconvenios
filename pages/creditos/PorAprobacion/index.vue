<template>
    <div>
        <barra-logeado/>
        <div class="bg-primary text-white text-center p-4">
                <h1><strong>SOLICITUDES POR APROVACION GERENTE</strong></h1>
            </div>
        <barra-creditos/>
        <div v-if="verCredit">
            <br>
            <div class="card">
                <div class="card-body">
                    <h2 class="card-title text-center bg-primary p-2 text-white">Documentacion recibida</h2>
                    <div v-if="creditoUnico.infoLab.validadoInfoCliente">
                        <h5 class="text-center">Documentacion validacion cliente</h5>
                        <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionCliente.casaOk">
                            <span class="input-group-text">Casa Propia</span>
                            <div class="form-control">si</div> 
                            <span class="input-group-text">Tiempo habitando la misma casa</span>
                            <div class="form-control">{{creditoUnico.infoLab.informacionCliente.tiempoEnCasa}}</div>                       
                        </div>
                        <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionCliente.negocioOk">
                            <span class="input-group-text">Negocio</span>
                            <div class="form-control">si</div>                        
                        </div>
                        <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionCliente.arrendoOk">
                            <span class="input-group-text">Tiempo habitando la misma casa</span>
                            <div class="form-control">{{creditoUnico.infoLab.informacionCliente.tiempoEnCasa}}</div>                        
                        </div>
                        <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionCliente.Objecion">
                            <span class="input-group-text">Observacion de la visita</span>
                            <textarea class="form-control" disabled v-model="creditoUnico.infoLab.informacionCliente.Objecion"></textarea>
                        </div>
                    </div>
                    <div v-if="creditoUnico.infoLab.validadoInfoLaboral">
                        <div v-if="creditoUnico.infoLab.infoLaboral.descripcionActividad">
                            <h5 class="text-center">Documentacion Laboral Independiente</h5>
                            <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionLaboralCliente.Fcyc">
                                <span class="input-group-text">Fotocopia C y C</span>
                                <div class="form-control">si</div> 
                            </div>
                            <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionLaboralCliente.Fci">                                
                                <span class="input-group-text">Fotocopia Cont independiente</span>
                                <div class="form-control">si</div>                       
                            </div>
                            <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionLaboralCliente.despDePago">
                                <span class="input-group-text">Desprendibles de pago</span>
                                <div class="form-control">si</div>                       
                            </div>
                        </div>
                        <div v-else-if="creditoUnico.infoLab.infoLaboral != 'Pensionado'">
                            <h6 class="text-center">Documentacion Laboral Empleado</h6>
                            <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionLaboralCliente.cartaLaboral">
                                <span class="input-group-text">Carta laboral</span>
                                <div class="form-control">si</div> 
                            </div>
                            <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionLaboralCliente.despDePago">
                                <span class="input-group-text">Desprendibles de pago</span>
                                <div class="form-control">si</div>                       
                            </div>
                        </div> 
                        <div v-else>
                            <h6 class="text-center">Documentacion Laboral Pensionado</h6>
                            <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionLaboralCliente.despDePago">
                                <span class="input-group-text">Desprendibles de pago</span>
                                <div class="form-control">si</div>                       
                            </div>
                        </div>                       
                        <div class="input-group mb-3" v-if="creditoUnico.infoLab.informacionLaboralCliente.Objecion">
                            <span class="input-group-text">Observacion </span>
                            <textarea class="form-control" disabled v-model="creditoUnico.infoLab.informacionLaboralCliente.Objecion"></textarea>                        
                        </div>
                    </div>             
                    <div v-if="creditoUnico.fiador">
                        <h5 class="text-center">Documentacion Fiador</h5>
                        <div class="input-group mb-3" v-if="creditoUnico.fiador">
                            <span class="input-group-text">Fotocopia C y C</span>
                            <div class="form-control">si</div> 
                        </div>
                        {{creditoUnico.fiador}}
                    </div> 
                    <div v-if="creditoUnico.prenda">
                        <h5 class="text-center">Documentacion Prenda</h5>
                        <div class="input-group mb-3">
                            <span class="input-group-text">Fotocopia C y C</span>
                            <div class="form-control">si</div> 
                        </div>
                        {{creditoUnico.prenda.informacionPrenda}}
                    </div>                                
                    <div v-if="creditoUnico.referidos.validados">
                        <h5 class="text-center p-4">Referencias</h5>
                        <div v-for="referencia,index in creditoUnico.referidos.referidos" :key="index" class="border">
                            <h6 class="text-center p-4">referencia {{index +1 }}</h6>
                            <div class="row g-2 p-1">
                                <div class="input-group mb-3 col-md-6">
                                    <span class="input-group-text">Nombre</span>
                                    <div class="form-control">{{referencia.nombreRF}}</div> 
                                </div>
                                <div class="input-group mb-3 col-md-6">
                                    <span class="input-group-text">Direccion</span>
                                    <div class="form-control">{{referencia.direccionRF}}</div>  
                                </div>
                                <div class="input-group mb-3 col-md-6">
                                    <span class="input-group-text">Telefono</span>
                                    <div class="form-control">{{referencia.telefonoRF}}</div> 
                                </div>
                                <div class="input-group mb-3 col-md-6" v-if="referencia.parentescoRF">
                                    <span class="input-group-text">Parentesco</span>
                                    <div class="form-control">{{referencia.parentescoRF}}</div> 
                                </div>
                            </div>
                            <div class="row g-2 p-1" >
                                <div class="input-group mb-3 col-md-6" v-if="referencia.llamadoOk">
                                    <span class="input-group-text">Llamado</span>
                                    <div class="form-control">Si</div> 
                                </div>
                                <div class="input-group mb-3 col-md-6" v-if="referencia.loConoceOk">
                                    <span class="input-group-text">Lo conoce</span>
                                    <div class="form-control">Si</div> 
                                </div>                              
                            </div>  
                            <div class="row g-2 p-1" >
                                <div class="input-group mb-3 col-md-12" v-if="referencia.objecion">
                                    <span class="input-group-text">Observacion</span>
                                    <textarea class="form-control" disabled v-model="referencia.objecion"></textarea>
                                </div>
                            </div>                              
                        </div>
                    </div>  
                    <br>     
                    <div class="btn btn-block p-1 btn-outline-primary" @click="aprovarCredito()"><h2>Aprobar</h2></div>
                    <div class="btn btn-block p-1 btn-outline-warning" @click="rechazarCredito()"><h2>Rechazar</h2></div>          
                    <div class="btn btn-block p-1 btn-outline-danger" @click="negarCredito()"><h2>Negar</h2></div>          
                    <div class="btn btn-block p-1 btn-outline-success" @click="cerrarVerCredito()"><h2>Cerrar</h2></div>
                </div>
            </div>
            
        </div>
        <table class="table table-hover table-sm text-center" v-else>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Valor</th>
                    <th>Frecuencia</th>
                    <th>Meses</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="credito in solicitudes" :key="credito._id" @click="verCredito(credito)">
                    <td>{{credito.numeroCredito}}</td>
                    <td>{{credito.cliente.nombreCliente}} {{credito.cliente.primerApellidoCliente}} {{credito.cliente.segundoApellidoCliente}}</td>
                    <td>{{credito.servicio}}</td>
                    <td>{{credito.valTotalCred}}</td>
                    <td>{{credito.frecuencia}}</td>
                    <td>{{credito.tiempo}}</td>
                </tr>
            </tbody>
        </table>
        <b-modal v-model="modal" no-close-on-esc no-close-on-backdrop hide-footer hide-header centered>
            <div class="text-center">
                <h2>{{info.message}}</h2>
                <div class="alert alert-danger">{{info.describa}}</div>
                <span class="input-group-text" v-if="info.message != 'Aprobar'">{{info.motivo}}</span>
                <textarea class="form-control"  v-if="info.message != 'Aprobar'" v-model="info.respMotivo"></textarea><br>
                <div class="btn btn-block btn-outline-primary" @click="guardar(info)"><h4>{{info.message}}</h4></div>
            </div>
            <br>
            <div class="btn btn-block btn-outline-info" @click="modal=false"><h4>Cerrar</h4></div>
        </b-modal>
        
    </div>
</template>
<script>
export default {
    middleware: 'auth', 
    async asyncData ({$axios}){
        const solicitudes = await $axios.$get('/creditos/primeraInstancia') 
        return {solicitudes}
    },
    data() {
        return {
            verCredit: false,
            creditoUnico:{},
            modal: false,
            info:{
                resMotivo:''
            }
        }
    },
    methods: {
        async verCredito(credito) {
            this.creditoUnico = credito
            this.verCredit = true
        },
        async cerrarVerCredito(){
            this.verCredit = false
        },
        aprovarCredito(){
            this.modal=true
            this.info.describa = 'Esta seguro que desea aprobar el credito?'
            this.info.motivo = ''
            this.info.resMotivo = ''
            this.info.message = 'Aprobar'
        },
        rechazarCredito(){
            this.modal=true
            this.info.describa = 'Recuerde que al no aprobar el credito, este pasara a estado de solicitud inicial, a la espera de los documentos faltantes o solucion al motivo de no aprobacion'
            this.info.motivo = 'Describa el motivo de no aprobacion'
            this.info.resMotivo = ''
            this.info.message = 'No aprobar'
        },
        negarCredito(){
            this.modal=true
            this.info.describa = 'Recuerde que al negar el credito, este pasara a estado de negado, sin posibilidad de volver a ser estudiado'
            this.info.motivo = 'Describa el motivo de negacion'
            this.info.resMotivo = ''
            this.info.message = 'Negar'
        },
        async guardar(info){
            console.log(info)
            if(info.message == 'Aprobar'){
                let data = {
                    id:this.creditoUnico._id,
                    estadoInterno:'Aprobado',
                }
                const respOk = await this.$axios.$post('/creditos/cambiarEstadoInterno', data)
                if(respOk.success){
                    this.verCredit = false
                    this.modal = false
                    this.$nuxt.refresh()
                }
            }
            if(info.message == 'No aprobar'){
                let data = {
                    id:this.creditoUnico._id,
                    estadoInterno:'No aprobado',
                }
                const respOk = await this.$axios.$post('/creditos/cambiarEstadoInterno', data)
                if(respOk.success){
                    this.verCredit = false
                    this.modal = false
                    this.$nuxt.refresh()
                }
            }
            if(info.message == 'Negar'){
                let data = {
                    id:this.creditoUnico._id,
                    estadoInterno:'Negado',
                }
                const respOk = await this.$axios.$post('/creditos/cambiarEstadoInterno', data)
                if(respOk.success){
                    this.verCredit = false
                    this.modal = false
                    this.$nuxt.refresh()
                }
            }
        }
    },
}
</script>

<style>

</style>