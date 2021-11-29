let tblUsuarios, tblClientes, tblCajas, tblProveedor, 
tblMedidas, tblCategorias, tblProductos, t_inventario,
t_h_c, t_h_v, editor, t_arqueo, t_moneda, myModal, tbl, myChart,
myChart_;
const expresiones = {
    usuario: /^[a-zA-Z0-9\_\-]{4,16}$/, // Letras, numeros, guion y guion_bajo
    nombre_corto: /^[a-zA-Z0-9\_\-]{2,5}$/, // Letras, numeros, guion y guion_bajo
    nombre: /^[a-zA-ZÀ-ÿ\s]{2,100}$/, // Letras y espacios, pueden llevar acentos.
    descripcion: /^[a-zA-Z0-9-ZÀ-ÿ\s]{5,100}$/, // Letras y espacios, pueden llevar acentos.
    clave: /^.{5,12}$/, // 4 a 12 digitos.
    correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    ruc: /^\d{11}$/, // 11.
    telefono: /^\d{9}$/, // 9.
    impuesto: /^\d{1,2}$/, // 9.
    numero: /^\d{1,9}$/, // 9.
    simbolo: /^.{1,10}$/, // 1 a 10.
    precios: /^[0-9]+([.][0-9]+)?$/
}
let campos = {
    usuario: false,
    nombre: false,
    descripcion: false,
    correo: false,
    clave: false,
    confirmar: false,
    simbolo: false,
    telefono: false,
    ruc: false,
    impuesto: false,
    numero: false,
    caja: false,
    precio_compra: false,
    precio_venta: false,
}
const inputs = document.querySelectorAll('#formulario input');
document.addEventListener("DOMContentLoaded", function(){
    $("input[type='text']").on("keypress", function () {
        $input = $(this);
        setTimeout(function () {
            $input.val($input.val().toUpperCase());
        }, 50);
    })
    if (document.getElementById('stockMinimo')) {
        reporteStock();
        topProductos();
        actualizarGrafico();
        actualizarGraficoCompra();
    }
    if (document.getElementById('impuesto') && document.getElementById('cant_factura')) {
        activarCampos();
    }
    //validaciones
    inputs.forEach((input) => {
        input.addEventListener('keyup', validarFormulario);
        input.addEventListener('blur', validarFormulario);
    });
    //fin validaciones
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    if (document.getElementById('myModal')) {
        myModal = new bootstrap.Modal(document.getElementById('myModal'));
    }
    //autocomplete
    $("#codigo_compra").autocomplete({
        minLength: 3,
        source: function (request, response) {
            $.ajax({
                url: base_url + 'Compras/buscarCodigo/',
                dataType: "json",
                data: {
                    pro: request.term
                },
                success: function (data) {
                    response(data);
                }
            });
        },
        select: function (event, ui) {
            document.getElementById('id').value = ui.item.id;
            document.getElementById('codigo_compra').value = ui.item.codigo;
            document.getElementById('precio').value = ui.item.precio_compra;
            document.getElementById('nombre').value = ui.item.descripcion;
            document.getElementById('cantidad').removeAttribute('disabled');
            document.getElementById('cantidad').focus();
        }
    })
    //autocomplete venta
    $("#codigo_venta").autocomplete({
        minLength: 2,
        source: function (request, response) {
            $.ajax({
                url: base_url + 'Compras/buscarVenta/',
                dataType: "json",
                data: {
                    pro: request.term
                },
                success: function (data) {
                    response(data);
                }
            });
        },
        select: function (event, ui) {
            document.getElementById('id').value = ui.item.id;
            document.getElementById('codigo_venta').value = ui.item.codigo;
            document.getElementById('precio').value = ui.item.precio;
            document.getElementById('nombre').value = ui.item.descripcion;
            document.getElementById('cantidad').removeAttribute('disabled');
            document.getElementById('cantidad').focus();
        }
    })
    $("#codigo_inventario").autocomplete({
        minLength: 2,
        source: function (request, response) {
            $.ajax({
                url: base_url + 'Compras/buscarVenta/',
                dataType: "json",
                data: {
                    pro: request.term
                },
                success: function (data) {
                    response(data);
                }
            });
        },
        select: function (event, ui) {
            document.getElementById('id').value = ui.item.id;
            document.getElementById('codigo_inventario').value = ui.item.codigo;
            document.getElementById('cantidad').value = ui.item.cantidad;
            document.getElementById('nombre').value = ui.item.descripcion;
            document.getElementById('agregar').focus();
        }
    })
    //Fin autocomple
    if (document.getElementById('editor')) {
        ClassicEditor
            .create(document.querySelector('#editor'),{
                toolbar: ['bold', 'italic', 'link', 'undo', 'redo', 'numberedList', 'bulletedList', 'blockQuote']
            })
            .then(newEditor => {
                editor = newEditor;
            })
            .catch(error => {
                console.error(error);
            });
    }
    $("#select_cliente").autocomplete({
        minLength: 2,
        source: function (request, response) {
            $.ajax({
                url: base_url + 'Clientes/buscarCliente/',
                dataType: "json",
                data: {
                    cli: request.term
                },
                success: function (data) {
                    response(data);
                }
            });
        },
        select: function (event, ui) {
            document.getElementById('id_cli').value = ui.item.id;
            document.getElementById('select_cliente').value = ui.item.nombre;
            document.getElementById('direccion_cli').value = ui.item.direccion;
        }
    });
    $("#select_proveedor").autocomplete({
        minLength: 2,
        source: function (request, response) {
            $.ajax({
                url: base_url + 'Proveedor/buscarProveedor/',
                dataType: "json",
                data: {
                    pr: request.term
                },
                success: function (data) {
                    response(data);
                }
            });
        },
        select: function (event, ui) {
            document.getElementById('id_pr').value = ui.item.id;
            document.getElementById('select_proveedor').value = ui.item.nombre;
            document.getElementById('direccion_pr').value = ui.item.direccion;
        }
    });
    const buttons = [{
            //Botón para Excel
            extend: 'excelHtml5',
            footer: true,
            title: 'Reporte',
            filename: 'Reporte',
            //Aquí es donde generas el botón personalizado
            text: '<span class="badge bg-success"><i class="fas fa-file-excel"></i></span>'
        },
        //Botón para PDF
        {
            extend: 'pdfHtml5',
            download: 'open',
            footer: true,
            title: 'Reporte',
            filename: 'Reporte',
            text: '<span class="badge bg-danger"><i class="fas fa-file-pdf"></i></span>',
            exportOptions: {
                columns: [0, 1, 2, 3, 5]
            }
        },
        //Botón para PDF
        {
            extend: 'copyHtml5',
            footer: true,
            title: 'Reporte',
            filename: 'Reporte',
            text: '<span class="badge bg-primary"><i class="fas fa-copy"></i></span>',
            exportOptions: {
                columns: [0, ':visible']
            }
        },
        //Botón para print
        {
            extend: 'print',
            footer: true,
            filename: 'Reporte',
            text: '<span class="badge bg-warning"><i class="fas fa-print"></i></span>'
        },
        //Botón para print
        {
            extend: 'csvHtml5',
            footer: true,
            filename: 'Reporte',
            text: '<span class="badge bg-success"><i class="fas fa-file-csv"></i></span>'
        },
        {
            extend: 'colvis',
            text: '<span class="badge bg-info"><i class="fas fa-columns"></i></span>',
            postfixButtons: ['colvisRestore']
        }
    ];
    const dom = "<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-5'i><'col-sm-7'p>>";
    tblUsuarios = $('#tblUsuarios').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Usuarios/listar",
            dataSrc: ''
        },
        columns: [
            {'data' : 'id'},
            {'data': 'usuario'},
            {'data': 'nombre'},
            {'data': 'correo'},
            {'data': 'caja'},
            {'data': 'estado'},
            {"data": "editar"},
            {"data": "eliminar"},
            {"data": "rol"}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
        bDestroy: true,
        iDisplayLength: 10,
        order: [
            [0, "desc"]
        ]
    });//Fin de la tabla usuarios
    t_moneda = $('#t_moneda').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: "" + base_url + "Administracion/listarMonedas",
            dataSrc: ""
        },
        columns: [{
                "data": "id"
            },
            {
                "data": "simbolo"
            },
            {
                "data": "nombre"
            },
            {
                "data": "estado"
            },
            {
                "data": "editar"
            }, 
            {
                "data": "eliminar"
            }
        ],
        language: {
                "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
            },
            dom,
            buttons,
            resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });
    tblClientes = $('#tblClientes').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Clientes/listar",
            dataSrc: ''
        },
        columns: [{'data': 'id'},
            {'data': 'dni'},
            {'data': 'nombre'},
            {'data': 'telefono'},
            {'data' : 'direccion'},
            {'data': 'estado'},
            {'data': 'editar'},
            {'data': 'eliminar'}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });//Fin de la tabla clientes
    tblProveedor = $('#tblProveedor').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + 'Proveedor/listar',
            dataSrc: ''
        },
        columns: [{
                'data': 'id'
            },
            {
                'data': 'ruc'
            },
            {
                'data': 'nombre'
            },
            {
                'data': 'telefono'
            },
            {
                'data': 'direccion'
            },
            {
                'data': 'estado'
            },
            {
                'data': 'editar'
            },
            {
                'data': 'eliminar'
            }
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
        bDestroy: true,
        iDisplayLength: 10,
        order: [
            [0, "desc"]
        ]
    }); //Fin de la tabla proveedor
    tblCajas = $('#tblCajas').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Cajas/listar",
            dataSrc: ''
        },
        columns: [
            {'data': 'id'},
            {'data': 'caja'},
            {'data': 'estado'},
            {'data': 'editar'},
            {'data': 'eliminar'}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });//Fin de la tabla Cajas
    tblMedidas = $('#tblMedidas').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Medidas/listar",
            dataSrc: ''
        },
        columns: [
            {'data': 'id'},
            {'data': 'nombre'},
            {'data': 'nombre_corto'},
            {'data': 'estado'},
            {'data': 'editar'},
            {'data': 'eliminar'}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });//Fin de la tabla Cajas
    tblCategorias= $('#tblCategorias').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Categorias/listar",
            dataSrc: ''
        },
        columns: [
            {'data': 'id'},
            {'data': 'nombre'},
            {'data': 'estado'},
            {'data': 'editar'},
            {'data': 'eliminar'}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });//Fin de la tabla categorias
    tblProductos = $('#tblProductos').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        pageLength: 25,
        ajax: {
            url: base_url + "Productos/listar",
            dataSrc: ''
        },
        columns: [
            {'data': 'id'},
            {'data': 'imagen'},
            {'data': 'codigo'},
            {'data': 'descripcion'},
            {'data': 'medida'},
            {'data': 'categoria'},
            {'data': 'precio_venta'},
            {'data': 'cantidad'},
            {'data': 'estado'},
            {'data': 'editar'},
            {'data': 'eliminar'}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        "createdRow": function (row, data, index) {
            //pintar una celda
            if (data.cantidad == 0) {
                $('td', row).eq(7).html('<span class="badge bg-warning">Agotado</span>');
            }
        },
        dom,
        buttons,
        resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });//Fin de productos
    t_inventario = $('#t_inventario').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Productos/listarInventario",
            dataSrc: ''
        },
        columns: [
            {'data': 'id_inventario'},
            {'data': 'descripcion'},
            {'data': 'fecha'},
            {'data': 'precio_compra'},
            {'data': 'precio_venta'},
            {'data': 'hora'}, 
            {'data': 'cantidad'},
            {'data': 'nombre'},
            {'data': 'accion'}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
        bDestroy: true,
        iDisplayLength: 10,
        order: [
            [0, "desc"]
        ]
    });
    t_h_c = $('#t_historial_c').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Compras/listar_historial",
            dataSrc: ''
        },
        columns: [
            {'data': 'id'},
            {'data': 'total'},
            {'data': 'fecha'},
            {'data': 'hora'},
            {'data': 'accion'},
            {'data': 'editar'},
            {'data': 'eliminar'}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });
    t_h_v = $('#t_historial_v').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Compras/listar_historial_venta",
            dataSrc: ''
        },
        columns: [
            {'data': 'id'},
            {'data': 'nombre'},
            {'data': 'fecha'},
            {'data': 'hora'},
            {'data': 'total'},
            {'data': 'accion'},
            {'data': 'editar'},
            {'data': 'eliminar'}
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });
    $('#min').change(function (e) {
        if (e.target.name == 'compras_min') {
            t_h_c.draw();
        } else if (e.target.name == 'ventas_min') {
            t_h_v.draw();
        } else if (e.target.name == 'inventario_min') {
            t_inventario.draw();
        } else {
            tbl.draw();
        }
    });
    $('#max').change(function (e) {
        if (e.target.name == 'compras_max') {
            t_h_c.draw();
        } else if (e.target.name == 'ventas_max') {
            t_h_v.draw();
        } else if (e.target.name == 'inventario_max') {
            t_inventario.draw();
        } else {
            tbl.draw();
        }
    });
    t_arqueo = $('#t_arqueo').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        ajax: {
            url: base_url + "Cajas/listar_arqueo",
            dataSrc: ''
        },
        columns: [{
                'data': 'id'
            },
            {
                'data': 'monto_inicial'
            },
            {
                'data': 'monto_final'
            },
            {
                'data': 'fecha_apertura'
            },
            {
                'data': 'fecha_cierre'
            },
            {
                'data': 'total_ventas'
            },
            {
                'data': 'monto_total'
            },
            {
                'data': 'estado'
            }
        ],
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        "createdRow": function (row, data, index) {
            //pintar una celda
            if (data.status == 0) {
                $('td', row).css({
                    'background-color': '#F89159',
                    'color': 'white',
                });
            }else{
               $('td', row).css({
                   'background-color': '#59B6F8',
                   'color': 'white',
               });
            }
        },
        dom,
        buttons,
        resonsieve: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [
                [0, "desc"]
            ]
    });
    tbl = $('#tbl').DataTable({
        responsive: true,
        processing: true,
        serverSide: false,
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json"
        },
        dom,
        buttons,
        resonsieve: true,
        bDestroy: true,
        iDisplayLength: 10,
        order: [
            [0, "desc"]
        ]
    }); //Fin de la tabla usuarios

})
function validarFormulario(e) {
    switch (e.target.name) {
        case "usuario":
            validarCampo(expresiones.usuario, e.target, 'usuario');
            break;
        case "nombre":
            validarCampo(expresiones.nombre, e.target, 'nombre');
            break;
        case "descripcion":
            validarCampo(expresiones.descripcion, e.target, 'descripcion');
            break;
        case "correo":
            validarCampo(expresiones.correo, e.target, 'correo');
            break;
        case "simbolo":
            validarCampo(expresiones.simbolo, e.target, 'simbolo');
            break;
        case "ruc":
            validarCampo(expresiones.ruc, e.target, 'ruc');
            break;
        case "telefono":
            validarCampo(expresiones.telefono, e.target, 'telefono');
            break;
        case "impuesto":
            validarCampo(expresiones.impuesto, e.target, 'impuesto');
            break;
        case "cant_factura":
            validarCampo(expresiones.numero, e.target, 'cant_factura');
            break;
        case "nombre_corto":
            validarCampo(expresiones.nombre_corto, e.target, 'nombre_corto');
            break;
        case "codigo":
            validarCampo(expresiones.usuario, e.target, 'codigo');
            break;
        case "precio_compra":
            validarCampo(expresiones.precios, e.target, 'precio_compra');
            break;
        case "precio_venta":
            validarCampo(expresiones.precios, e.target, 'precio_venta');
            break;
        case "clave":
            validarCampo(expresiones.clave, e.target, 'clave');
            validarPass();
            break;
        case "confirmar":
            validarPass();
            break;
    }
}

function validarPass() {
    const clave = document.getElementById('clave');
    const confirmar = document.getElementById('confirmar');
    if (clave.value !== confirmar.value) {
        confirmar.classList.add('is-invalid');
        confirmar.classList.remove('is-valid');
        campos['clave'] = false;
        campos['confirmar'] = false;
    } else if (clave.value == '' && confirmar.value == '') {
        confirmar.classList.add('is-invalid');
        confirmar.classList.remove('is-valid');
        campos['clave'] = false;
        campos['confirmar'] = false;
    } else {
        confirmar.classList.remove('is-invalid');
        confirmar.classList.add('is-valid');
        campos['clave'] = true;
        campos['confirmar'] = true;
    }
}
function validarCampo(expresion, input, campo) {
    if (expresion.test(input.value)) {
        document.getElementById(campo).classList.remove('is-invalid');
        document.getElementById(campo).classList.add('is-valid');
        campos[campo] = true;
    } else {
        document.getElementById(campo).classList.add('is-invalid');
        document.getElementById(campo).classList.remove('is-valid');
        campos[campo] = false;
    }
}
function activarCampos() {
    campos.usuario = true;
    campos.nombre = true;
    campos.descripcion = true;
    campos.correo = true;
    campos.clave = true;
    campos.confirmar = true;
    campos.simbolo = true;
    campos.telefono = true;
    campos.ruc = true;
    campos.impuesto = true;
    campos.numero = true;
    campos.codigo = true;
    campos.nombre_corto = true;
    campos.precio_compra = true;
    campos.precio_venta = true;
    const verf = document.querySelectorAll('input');
    verf.forEach(element => {
        element.classList.remove('is-invalid');
        element.classList.add('is-valid');
    });
}
function desactivarCampos() {
    campos.usuario = false;
    campos.nombre = false;
    campos.descripcion = false;
    campos.correo = false;
    campos.clave = false;
    campos.confirmar = false;
    campos.simbolo = false;
    campos.telefono = false;
    campos.ruc = false;
    campos.impuesto = false;
    campos.numero = false;
    campos.codigo = false;
    campos.nombre_corto = false;
    campos.precio_compra = false;
    campos.precio_venta = false;
    const verf = document.querySelectorAll('input');
    verf.forEach(element => {
        element.classList.remove('is-valid');
    });
}
if (document.getElementById('min') && document.getElementById('max')) {
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            let desde = $('#min').val();
            let hasta = $('#max').val();
            let fecha = data[2].trim();
            if (desde == '' || hasta == '') {
                return true;
            }
            if (fecha >= desde && fecha <= hasta) {
                return true;
            } else {
                return false;
            }
        }
    );
}
function frmCambiarPass(e) {
    e.preventDefault();
    const actual = document.getElementById('clave_actual').value;
    const nueva = document.getElementById('clave_nueva').value;
    const confirmar = document.getElementById('confirmar_clave').value;
    if (actual == '' || nueva == '' || confirmar == '') {
        alertas('Todo los campos son obligatorios', 'warning');
        return false;
    } else {
        if (nueva != confirmar) {
            alertas('Las contraseñas no coinciden', 'warning');
            return false;
        }else{
            const url = base_url + "Usuarios/cambiarPass";
            const frm = document.getElementById("frmCambiarPass");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    myModal.hide();
                    frm.reset();
                }
            }
        }
    }
}

function frmUsuario() {
    desactivarCampos();
    document.getElementById("title").textContent = "Nuevo Usuario";
    document.getElementById("btnAccion").textContent = "Registrar";
    document.getElementById("claves").classList.remove("d-none");
    document.getElementById("formulario").reset();
    document.getElementById("id").value = "";
    myModal.show();
}
function registrarUser(e) {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value;
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const caja = document.getElementById("caja").value;
    if (usuario == "" || nombre == "" || correo == "" || caja == "") {
        alertas('Todo los campos son obligatorios', 'warning');
        return false;
    } else {
        if (campos.usuario && campos.nombre && campos.correo && campos.clave) {
            const url = base_url + "Usuarios/registrar";
            const frm = document.getElementById("formulario");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    myModal.hide();
                    tblUsuarios.ajax.reload();
                    alertas(res.msg, res.icono);
                }
            }
        } else {
            alertas('En algunos campos hay problemas', 'warning');
        }
    }
}
function btnEditarUser(id) {
    activarCampos();
    document.getElementById("title").textContent = "Actualizar usuario";
    document.getElementById("btnAccion").textContent = "Modificar";
    const url = base_url + "Usuarios/editar/"+id;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            document.getElementById("id").value = res.id;
            document.getElementById("usuario").value = res.usuario;
            document.getElementById("nombre").value = res.nombre;
            document.getElementById("correo").value = res.correo;
            document.getElementById("caja").value = res.id_caja;
            document.getElementById("claves").classList.add("d-none");
            myModal.show();
        }
    }
}
function btnEliminarUser(id) {
    Swal.fire({
        title: 'Esta seguro de eliminar?',
        text: "El usuario no se eliminará de forma permanente, solo cambiará el estado a inactivo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Usuarios/eliminar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    tblUsuarios.ajax.reload();
                }
            }
            
        }
    })
}
function btnReingresarUser(id) {
    Swal.fire({
        title: 'Esta seguro de reingresar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Usuarios/reingresar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        }
    })
}

//Fin Usuarios
function frmCliente() {
    desactivarCampos();
    document.getElementById("title").textContent = "Nuevo Cliente";
    document.getElementById("btnAccion").textContent = "Registrar";
    document.getElementById("formulario").reset();
    document.getElementById("id").value = "";
    myModal.show();
}
function registrarCli(e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const direccion = document.getElementById("direccion").value;
    if (nombre == '' || telefono == '' || direccion == '') {
        alertas('Todo los campos son obligatorios', 'warning');
    } else {
        if (campos.nombre && campos.telefono) {
            const url = base_url + 'Clientes/registrar';
            const frm = document.getElementById("formulario");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    frm.reset();
                    myModal.hide();
                    tblClientes.ajax.reload();
                }
            }
        } else {
            alertas('En algunos campos hay problemas', 'warning');
        }
    }
}
function btnEditarCli(id) {
    activarCampos();
    document.getElementById("title").textContent = "Actualizar cliente";
    document.getElementById("btnAccion").textContent = "Modificar";
    const url = base_url + "Clientes/editar/" + id;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            document.getElementById("id").value = res.id;
            document.getElementById("dni").value = res.dni;
            document.getElementById("nombre").value = res.nombre;
            document.getElementById("telefono").value = res.telefono;
            document.getElementById("direccion").value = res.direccion;
                myModal.show();
        }
    }
}
function btnEliminarCli(id) {
    Swal.fire({
        title: 'Esta seguro de eliminar?',
        text: "El cliente no se eliminará de forma permanente, solo cambiará el estado a inactivo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Clientes/eliminar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    tblClientes.ajax.reload();
                    alertas(res.msg, res.icono);
                }
            }

        }
    })
}
function btnReingresarCli(id) {
    Swal.fire({
        title: 'Esta seguro de reingresar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Clientes/reingresar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        }
    })
}//Fin Clientes
function frmProveedor() {
    desactivarCampos();
    document.getElementById("title").textContent = "Nuevo Proveedor";
    document.getElementById("btnAccion").textContent = "Registrar";
    document.getElementById("formulario").reset();
    document.getElementById("id").value = "";
    myModal.show();
}

function registrarProveedor(e) {
    e.preventDefault();
    const ruc = document.getElementById("ruc").value;
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const direccion = document.getElementById("direccion").value;
    if (ruc == '' || nombre == '' || telefono == '' || direccion == '') {
        alertas('Todo los campos son obligatorios', 'warning');
    } else {
        if (campos.nombre && campos.telefono) {
            const url = base_url + 'Proveedor/registrar';
            const frm = document.getElementById("formulario");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    frm.reset();
                    myModal.hide();
                    tblProveedor.ajax.reload();
                }
            }
        } else {
            alertas('En algunos campos hay problemas', 'warning');
        }
    }
}

function btnEditarPr(id) {
    activarCampos();
    document.getElementById("title").textContent = "Actualizar Proveedor";
    document.getElementById("btnAccion").textContent = "Modificar";
    const url = base_url + 'Proveedor/editar/' + id;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            document.getElementById("id").value = res.id;
            document.getElementById("ruc").value = res.ruc;
            document.getElementById("nombre").value = res.nombre;
            document.getElementById("telefono").value = res.telefono;
            document.getElementById("direccion").value = res.direccion;
            myModal.show();
        }
    }
}

function btnEliminarPr(id) {
    Swal.fire({
        title: 'Esta seguro de eliminar?',
        text: "El proveedor no se eliminará de forma permanente, solo cambiará el estado a inactivo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + 'Proveedor/eliminar/' + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    tblProveedor.ajax.reload();
                    alertas(res.msg, res.icono);
                }
            }

        }
    })
}

function btnReingresarPr(id) {
    Swal.fire({
        title: 'Esta seguro de reingresar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + 'Proveedor/reingresar/' + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        }
    })
} //Fin Proveedor
function frmCaja() {
    desactivarCampos();
    document.getElementById("title").textContent = "Nuevo Caja";
    document.getElementById("btnAccion").textContent = "Registrar";
    document.getElementById("formulario").reset();
    document.getElementById("id").value = "";
    myModal.show();
}
function registrarCaja(e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre");
    if (nombre.value == "") {
        alertas('El nombre es requerido', 'warning');
    } else {
        if (campos.nombre) {
            const url = base_url + "Cajas/registrar";
            const frm = document.getElementById("formulario");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    frm.reset();
                    myModal.hide();
                    tblCajas.ajax.reload();
                }
            }
        } else {
            alertas('El campos nombre tiene problemas', 'warning');
        }
    }
}
function btnEditarCaja(id) {
    document.getElementById("title").textContent = "Actualizar caja";
    document.getElementById("btnAccion").textContent = "Modificar";
    const url = base_url + "Cajas/editar/" + id;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            document.getElementById("id").value = res.id;
            document.getElementById("nombre").value = res.caja;
            myModal.show();
        }
    }
}
function btnEliminarCaja(id) {
    Swal.fire({
        title: 'Esta seguro de eliminar?',
        text: "La caja no se eliminará de forma permanente, solo cambiará el estado a inactivo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Cajas/eliminar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    tblCajas.ajax.reload();
                }
            }
        }
    })
}
function btnReingresarCaja(id) {
    Swal.fire({
        title: 'Esta seguro de reingresar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Cajas/reingresar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        }
    })
}//Fin Cajas
function frmMedida() {
    desactivarCampos();
    document.getElementById("title").textContent = "Nuevo Medida";
    document.getElementById("btnAccion").textContent = "Registrar";
    document.getElementById("formulario").reset();
    document.getElementById("id").value = "";
    myModal.show();
}
function registrarMedida(e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const nombre_corto = document.getElementById("nombre_corto").value;
    if (nombre == '' || nombre_corto == '') {
        alertas('Todo los campos son requeridos', 'warning');
    } else {
        if (campos.nombre && campos.nombre_corto) {
            const url = base_url + 'Medidas/registrar';
            const frm = document.getElementById("formulario");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    frm.reset();
                    myModal.hide();
                    tblMedidas.ajax.reload();
                }
            }
        } else {
            alertas('En algunos campos hay problemas', 'warning');
        }
    }
}
function btnEditarMed(id) {
    activarCampos();
    document.getElementById("title").textContent = "Actualizar medida";
    document.getElementById("btnAccion").textContent = "Modificar";
    const url = base_url + 'Medidas/editar/' + id;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            document.getElementById("id").value = res.id;
            document.getElementById("nombre").value = res.nombre;
            document.getElementById("nombre_corto").value = res.nombre_corto;
            myModal.show();
        }
    }
}
function btnEliminarMed(id) {
    Swal.fire({
        title: 'Esta seguro de eliminar?',
        text: "El medida no se eliminará de forma permanente, solo cambiará el estado a inactivo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Medidas/eliminar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    tblMedidas.ajax.reload();
                }
            }
        }
    })
}
function btnReingresarMed(id) {
    Swal.fire({
        title: 'Esta seguro de reingresar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Medidas/reingresar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }

        }
    })
}//Fin Medidas
function frmCategoria() {
    desactivarCampos();
    document.getElementById("title").textContent = "Nueva Categoria";
    document.getElementById("btnAccion").textContent = "Registrar";
    document.getElementById("formulario").reset();
    document.getElementById("id").value = "";
    myModal.show();
}
function registrarCategoria(e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre");
    if (nombre.value == "") {
        alertas('El nombre es requerido', 'warning');
    } else {
        if (campos.nombre) {
            const url = base_url + 'Categorias/registrar';
            const frm = document.getElementById("formulario");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    frm.reset();
                    myModal.hide();
                    tblCategorias.ajax.reload();
                }
            }
        } else {
            alertas('El campos nombre tiene problemas', 'warning');
        }
    }
}
function btnEditarCat(id) {
    document.getElementById("title").textContent = "Actualizar Categoria";
    document.getElementById("btnAccion").textContent = "Modificar";
    const url = base_url + "Categorias/editar/" + id;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            document.getElementById("id").value = res.id;
            document.getElementById("nombre").value = res.nombre;
            myModal.show();
        }
    }
}
function btnEliminarCat(id) {
    Swal.fire({
        title: 'Esta seguro de eliminar?',
        text: "La categoria no se eliminará de forma permanente, solo cambiará el estado a inactivo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Categorias/eliminar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    tblCategorias.ajax.reload();
                }
            }

        }
    })
}
function btnReingresarCat(id) {
    Swal.fire({
        title: 'Esta seguro de reingresar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + 'Categorias/reingresar/' + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        }
    })
}//Fin categorias
function frmProducto() {
    desactivarCampos();
    document.getElementById("title").textContent = "Nuevo Producto";
    document.getElementById("btnAccion").textContent = "Registrar";
    document.getElementById("formulario").reset();
    document.getElementById("id").value = "";
    myModal.show();
    deleteImg();
}
function registrarPro(e) {
    e.preventDefault();
    const codigo = document.getElementById("codigo").value;
    const nombre = document.getElementById("descripcion").value;
    const precio_compra = document.getElementById("precio_compra").value;
    const precio_venta = document.getElementById("precio_venta").value;
    const id_medida = document.getElementById("medida").value;
    const id_cat = document.getElementById("categoria").value;
    if (codigo == '' || nombre == '' || precio_compra == '' || precio_venta == '' || id_medida == '' || id_cat == '') {
        alertas('Todo los campos son requeridos', 'warning');
        return false;
    } else {
        if (campos.codigo && campos.descripcion && campos.precio_compra && campos.precio_venta) {
            const url = base_url + 'Productos/registrar';
            const frm = document.getElementById("formulario");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.upload.addEventListener('progress', function () {
                document.getElementById('btnAccion').textContent = 'Procesando...';
            });
            http.send(new FormData(frm));
            http.addEventListener('load', function () {
                document.getElementById('btnAccion').textContent = 'Procesando...';
            });
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log(this.responseText);
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    frm.reset();
                    myModal.hide();
                    tblProductos.ajax.reload();
                }
            }
        } else {
            alertas('En algunos campos hay problemas', 'warning');
        }
    }
}
function btnEditarPro(id) {
    activarCampos();
    document.getElementById("title").textContent = "Actualizar Producto";
    document.getElementById("btnAccion").textContent = "Modificar";
    const url = base_url + 'Productos/editar/' + id;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            document.getElementById("id").value = res.id;
            document.getElementById("codigo").value = res.codigo;
            document.getElementById("descripcion").value = res.descripcion;
            document.getElementById("precio_compra").value = res.precio_compra;
            document.getElementById("precio_venta").value = res.precio_venta;
            document.getElementById("medida").value = res.id_medida;
            document.getElementById("categoria").value = res.id_categoria;
            document.getElementById("img-preview").src = base_url + 'Assets/img/pro/'+ res.foto;
            document.getElementById("icon-cerrar").innerHTML = `
            <button class="btn btn-outline-danger" onclick="deleteImg()">
            <i class="fas fa-times-circle"></i></button>`;
            document.getElementById("icon-image").classList.add("d-none");
            document.getElementById("foto_actual").value = res.foto;
            myModal.show();
        }
    }
}
function btnEliminarPro(id) {
    Swal.fire({
        title: 'Esta seguro de eliminar?',
        text: "El producto no se eliminará de forma permanente, solo cambiará el estado a inactivo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Productos/eliminar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    if (document.getElementById('ProductosVendidos')) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }else{
                        tblProductos.ajax.reload();
                    }

                }
            }

        }
    })
}
function btnReingresarPro(id) {
    Swal.fire({
        title: 'Esta seguro de reingresar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Productos/reingresar/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }

        }
    })
}
function preview(e) {
    var input = document.getElementById('imagen');
    var filePath = input.value;
    var extension = /(\.png|\.jpeg|\.jpg)$/i;
    if (!extension.exec(filePath)) {
        alertas('Seleccione un archivo valido', 'warning');
        deleteImg();
        return false;
    } else {
        const url = e.target.files[0];
        const urlTmp = URL.createObjectURL(url);
        document.getElementById("img-preview").src = urlTmp;
        document.getElementById("icon-image").classList.add("d-none");
        document.getElementById("icon-cerrar").innerHTML = `
        <button class="btn btn-outline-danger" onclick="deleteImg()"><i class="fas fa-times-circle"></i></button>
        `;
    }
}
function previewLogo(e) {
    var input = document.getElementById('imagen');
    var filePath = input.value;
    var extension = /(\.png)$/i;
    if (!extension.exec(filePath)) {
        alertas('Seleccione un formato png', 'warning');
        deleteImg();
        return false;
    } else {
        const url = e.target.files[0];
        const urlTmp = URL.createObjectURL(url);
        document.getElementById("img-preview").src = urlTmp;
        document.getElementById("icon-image").classList.add("d-none");
        document.getElementById("icon-cerrar").innerHTML = `
        <button class="btn btn-outline-danger" onclick="deleteImg()"><i class="fas fa-times-circle"></i></button>
        `;
    }
}
function deleteImg() {
    document.getElementById("icon-cerrar").innerHTML = '';
    document.getElementById("icon-image").classList.remove("d-none");
    document.getElementById("img-preview").src = '';
    document.getElementById("imagen").value = '';
    document.getElementById("foto_actual").value = '';
}
function calcularPrecio(e) {
    e.preventDefault();
    const cant = document.getElementById("cantidad").value;
    const precio = document.getElementById("precio").value;
    let total = precio * cant;
    document.getElementById("sub_total").value = total.toFixed(2);
    if (e.which == 13) {
        if (cant > 0) {
            const url = base_url + "Compras/ingresar";
            const frm = document.getElementById("frmCompra");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    frm.reset();
                    cargarDetalle();
                    document.getElementById('cantidad').setAttribute('disabled', 'disabled');
                    document.getElementById('codigo_compra').focus();
                }
            }
        } else {
            document.getElementById('cantidad').classList.add('is-invalid');
        }
    }
}

function calcularPrecioVenta(e) {
    e.preventDefault();
    const cant = document.getElementById("cantidad").value;
    const precio = document.getElementById("precio").value;
    let total = precio * cant;
    document.getElementById("sub_total").value = total.toFixed(2);
    if (e.which == 13) {
        if (cant > 0) {
            const url = base_url + "Compras/ingresarVenta";
            const frm = document.getElementById("frmVenta");
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    frm.reset();
                    cargarDetalleVenta();
                    document.getElementById('cantidad').setAttribute('disabled', 'disabled');
                    document.getElementById('codigo_venta').focus();
                }
            }
        } else {
            document.getElementById('cantidad').classList.add('is-invalid');
        }
    }
}
if (document.getElementById('tblDetalle')) {
    cargarDetalle();
}
if (document.getElementById('tblDetalleVenta')) {
    cargarDetalleVenta();
}

function cargarDetalle() {
    const url = base_url + 'Compras/listar/detalle';
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            let html = '';
            res.detalle.forEach(row => {
                html += `<tr>
               <td>${row.id}</td>
               <td>${row.descripcion}</td>
               <td>${row.cantidad}</td>
               <td>${row.precio}</td>
               <td>${row.sub_total}</td>
               <td>
               <button class="btn btn-outline-danger" type="button" onclick="deleteDetalle(${row.id}, 1)">
               <i class="fas fa-trash-alt"></i></button>
               </td>
               </tr>`;
            });
            document.getElementById("tblDetalle").innerHTML = html;
            document.getElementById("alert_total").textContent = res.total_pagar.total;
            document.getElementById("total").textContent = res.total_pagar.total;
        }
    }
}
function cargarDetalleVenta() {
    const url = base_url + "Compras/listar/detalle_temp";
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            let html = '';
            res.detalle.forEach(row => {
                html += `<tr>
               <td>${row.id}</td>
               <td>${row.descripcion}</td>
               <td>${row.cantidad}</td>
               <td><input class="form-control" placeholder="Desc" type="text" onkeyup="calcularDescuento(event, ${row.id})"></td>
               <td>${row.descuento}</td>
               <td>${row.precio}</td>
               <td>${row.sub_total}</td>
               <td>
               <button class="btn btn-outline-danger" type="button" onclick="deleteDetalle(${row.id}, 2)">
               <i class="fas fa-trash-alt"></i></button>
               </td>
               </tr>`;
            });
            document.getElementById("tblDetalleVenta").innerHTML = html;
            document.getElementById("alert_total").textContent = res.total_pagar.total;
            document.getElementById("total").textContent = res.total_pagar.total;
        }
    }
}

function calcularDescuento(e, id) {
    e.preventDefault();
    if (e.target.value == '') {
        alertas('Ingrese el descuento', 'warning');
    } else {
        if (e.which == 13) {
            const url = base_url + 'Compras/calcularDescuento/' + id + '/' + e.target.value;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    cargarDetalleVenta();
                }
            }
        }
    }
}

function deleteDetalle(id, accion) {
    let url;
    if (accion == 1) {
        url = base_url + 'Compras/delete/' + id;
    } else {
        url = base_url + 'Compras/deleteVenta/' + id;
    }
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            alertas(res.msg, res.icono);
            if (accion == 1) {
                cargarDetalle();
            } else {
                cargarDetalleVenta();
            }
        }
    }
}
function procesar(accion) {
    Swal.fire({
        title: 'Esta seguro de Procesar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            let fila = document.querySelectorAll("#detalle_ tr").length;
            if (fila < 2) {
                alertas('La tabla esta vacia', 'warning');
                return false;
            } else {
                let url;
                let tipo = document.getElementById('tipo').value;
                if (accion == 1) {
                    let id_pro = document.getElementById('id_pr').value;
                    if (id_pro == '') {
                        id_pro = 1;
                    }
                    url = base_url + 'Compras/registrarCompra/' + id_pro + '/' + tipo;
                } else {
                    let id_cliente = document.getElementById('id_cli').value;
                    if (id_cliente == '') {
                        id_cliente = 1;
                    }
                    url = base_url + 'Compras/registrarVenta/' + id_cliente + '/' + tipo;
                }
                const http = new XMLHttpRequest();
                http.open("GET", url, true);
                http.send();
                http.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        const res = JSON.parse(this.responseText);
                        if (res.icono == 'success') {
                            document.getElementById('procesarVenta').classList.add('d-none');
                            alertas(res.msg, res.icono);
                            let ruta;
                            document.getElementById('formulario_cobrar').reset();
                            if (accion == 1) {
                                cargarDetalle();
                                if (tipo == 1) {
                                    ruta = base_url + 'Compras/generarPdf/' + res.id_compra;
                                }else{
                                    ruta = base_url + 'Compras/generarFacturaCompra/' + res.id_compra;
                                }
                            } else {
                                cargarDetalleVenta();
                                if (tipo == 1) {
                                    ruta = base_url + 'Compras/generarPdfVenta/' + res.id_venta;
                                } else {
                                    ruta = base_url + 'Compras/generarFacturaVenta/' + res.id_venta;
                                }
                            }
                            myModal.hide();
                            setTimeout(() => {
                                window.open(ruta);
                            }, 2000);
                        } else {
                            alertas(res.msg, res.icono);
                        }
                    }
                }
            }
        }
    })
}
function modificarEmpresa(e) {
    e.preventDefault();
    const id = document.getElementById("id").value;
    const ruc = document.getElementById("ruc").value;
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const correo = document.getElementById("correo").value;
    const direccion = document.getElementById("direccion").value;
    const cant_factura = document.getElementById("cant_factura").value;

    if (id == '' || ruc == '' || nombre == '' || telefono == '' || correo == '' || direccion == '' || cant_factura == '') {
        alertas('Todo los campos son requerido', 'warning');
        return false;
    } else {
        if (campos.ruc && campos.nombre && campos.telefono && campos.correo
            && campos.impuesto && campos.numero) {
            const frm = document.getElementById('formulario');
            const url = base_url + 'Administracion/modificar';
            const http = new XMLHttpRequest();
            let frmData = new FormData(frm);
            frmData.append('mensaje', editor.getData());
            http.open("POST", url, true);
            http.upload.addEventListener('progress', function () {
                document.getElementById('btnAccion').textContent = 'Procesando...';
            });
            http.send(frmData);
            http.addEventListener('load', function () {
                document.getElementById('btnAccion').textContent = 'Modificar';
            });
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                }
            }
        } else {
           alertas('En algunos campos hay problemas', 'warning');
        }
    }
}
function alertas(mensaje, icono) {
    Swal.fire({
        position: 'top-end',
        icon: icono,
        title: mensaje,
        showConfirmButton: false,
        timer: 3000
    })
}
function btnAnularC(id) {
    Swal.fire({
        title: 'Esta seguro de anular la Compra?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + 'Compras/anularC/' + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    t_h_c.ajax.reload();
                }
            }

        }
    })
}
function btnAnularV(id) {
    Swal.fire({
        title: 'Esta seguro de anular la Venta?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + 'Compras/anularV/' + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    t_h_v.ajax.reload();
                }
            }

        }
    })
}
function mostrarTodo(e) {
    document.getElementById('min').value = '';
    document.getElementById('max').value = '';
    if (e.target.name == 'compra') {
        t_h_c.draw();
    } else if (e.target.name == 'venta') {
        t_h_v.draw();
    } else if (e.target.name == 'inventario') {
        t_inventario.draw();
    } else {
        tbl.draw();
    }
}
function arqueoCaja() {
    document.getElementById('title').textContent = 'Abrir Caja';
    document.getElementById('ocultar_campos').classList.add('d-none');
    document.getElementById('monto_inicial').value = '';
    document.getElementById('btnAccion').textContent = 'Abrir Caja';
    myModal.show();
}
function abrirArqueo(e) {
    e.preventDefault();
    const monto_inicial = document.getElementById('monto_inicial').value;
    if (monto_inicial == '') {
        alertas('Ingrese el Monto Inicial', 'warning');
    } else {
        const frm = document.getElementById('frmAbrirCaja');
        const url = base_url + 'Cajas/abrirArqueo';
        const http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.send(new FormData(frm));
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);
                if (res.icono == 'success') {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
                myModal.hide();
                alertas(res.msg, res.icono);
                if (document.getElementById('btnAbrirCaja')) {
                    document.getElementById('btnAbrirCaja').classList.add('d-none');
                }else{
                    document.getElementById('btnCerrarCaja').classList.add('d-none');
                }
            }
        }
    }
}

function cerrarCaja() {
    document.getElementById('title').textContent = 'Cerrar Caja';
    const url = base_url + "Cajas/getVentas";
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            
            const res = JSON.parse(this.responseText);
            document.getElementById('monto_final').value = 0;
            if (res.monto_total.total != null) {
                document.getElementById('monto_final').value = res.monto_total.total;
            }
            document.getElementById('total_ventas').value = res.total_ventas.total;
            document.getElementById('monto_inicial').value = res.inicial.monto_inicial;
            document.getElementById('monto_general').value = res.monto_general;
            document.getElementById('id').value = res.inicial.id;
            document.getElementById('ocultar_campos').classList.remove('d-none');
            document.getElementById('btnAccion').textContent = 'Cerrar Caja';
            myModal.show();
        }
    }
}
function base_datos(e) {
    e.preventDefault();
    document.getElementById('importar_bd').textContent = 'Importar';
    var input = document.getElementById('b_datos');
    var filePath = input.value;
    var extension = /(\.csv|\.xlsx|\.xls)$/i;

    if (!extension.exec(filePath)) {
        alertas('Seleccione un archivo valido', 'warning');
        input.value = '';
        document.getElementById('importar_bd').classList.add('d-none');
        return false;
    }else{
        document.getElementById('importar_bd').classList.remove('d-none');
    }
}
function importar_productos(e) {
    e.preventDefault();
    const dato = document.getElementById('b_datos');
    if (dato.value == '') {
        alertas('Selecciona el archivo', 'warning');
    } else {
        const frm = document.getElementById('frmBd');
        const http = new XMLHttpRequest();
        const url = base_url + "Administracion/base_datos";
        http.open("POST", url, true);
        // upload progress event
        http.upload.addEventListener('progress', function (e) {
            document.getElementById('importar_bd').textContent = 'Procesando';
        });
        http.send(new FormData(frm));
        http.addEventListener('load', function (e) {
            document.getElementById('importar_bd').classList.add('d-none');
        });
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);
                if (res.icono == 'success') {
                    alertas(res.msg, res.icono);
                    tblProductos.ajax.reload();
                } else {
                    alertas('Error al Importar los Productos, Asegurece de que sea el mismo formato', 'error');
                }
                frm.reset();
            }
        }
    }
}

function registrarPermisos(e) {
    e.preventDefault();
    const http = new XMLHttpRequest();
    const frm = document.getElementById("formulario");
    const url = base_url + 'Usuarios/registrarPermisos';
    http.open("POST", url);
    http.send(new FormData(frm));
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            alertas(res.msg, res.icono);
        }
    }
}
function agregarPro(e, id) {
    const http = new XMLHttpRequest();
    const url = base_url + "Productos/agregar/" + id;
    http.open("GET", url);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            if (res.icono == 'success') {
                e.target.textContent = 'Agregado';
            }
            alertas(res.msg, res.icono);
            return false;
        }
    }
}
//Monedas
function frmMoneda() {
    desactivarCampos();
    document.getElementById('id').value = '';
    document.getElementById('title').textContent = 'Nuevo Moneda';
    document.getElementById('btnAccion').textContent = 'Registrar';
    document.getElementById('formulario').reset();
    myModal.show();
}

function registrarMoneda(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre');
    const simbolo = document.getElementById('simbolo');
    if (nombre.value == '' || simbolo.value == '') {
        alertas('Todo los campos son requeridos', 'warning');
        return false;
    } else {
        if (campos.simbolo && campos.nombre){
            const url = base_url + 'Administracion/registrarMoneda';
            const frm = document.getElementById('formulario');
            const http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.send(new FormData(frm));
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    myModal.hide();
                    t_moneda.ajax.reload();
                }
            }
        }else{
            alertas('En algunos campos hay problemas', 'warning');
        }
    }
}

function btnEditarMoneda(id) {
    activarCampos();
    document.getElementById('title').textContent = 'Modificar Moneda';
    document.getElementById('btnAccion').textContent = 'Modificar';
    const url = base_url + 'Administracion/editarMoneda/' + id;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            document.getElementById('id').value = res.id;
            document.getElementById('nombre').value = res.nombre;
            document.getElementById('simbolo').value = res.simbolo;
            myModal.show();
        }
    }
}

function btnEliminarMoneda(id) {
    Swal.fire({
        title: 'Esta seguro de eliminar?',
        text: "La moneda no se eliminará de forma permanente, solo cambiará el estado a inactivo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Administracion/eliminarMoneda/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    t_moneda.ajax.reload();
                }
            }
        }
    })
}

function btnReingresarMoneda(id) {
    Swal.fire({
        title: 'Esta seguro de reingresar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = base_url + "Administracion/reingresarMoneda/" + id;
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertas(res.msg, res.icono);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }

        }
    })
} //fin moneda
function salir() {
    Swal.fire({
        title: 'Esta seguro de cerrar la sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location = base_url + 'Usuarios/salir';
        }
    })
}
function registrarInventario(e) {
    e.preventDefault();
    const id = document.getElementById("id").value;
    const codigo = document.getElementById("codigo_inventario").value;
    const agregar = document.getElementById("agregar").value;
    if (id == '' || codigo == '' || agregar == '') {
        alertas('Todo los campos con * son requerido', 'warning');
        return false;
    } else {
        const url = base_url + 'Productos/registrarInventario';
        const frm = document.getElementById("formulario");
        const http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.send(new FormData(frm));
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);
                alertas(res.msg, res.icono);
                frm.reset();
                myModal.hide();
                t_inventario.ajax.reload();
            }
        }
    }
}
function actualizarDatos(e) {
    e.preventDefault();
    const user = document.getElementById('usuario').value;
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const apellido = document.getElementById('apellido').value;
    if (user == '' || nombre == '' || apellido == '' || correo == '' || telefono == '' || direccion == '') {
        alertas('Todo los campos son requeridos', 'warning');
        return false;
    } else {
        const url = base_url + 'Usuarios/actualizarDato';
        const frm = document.getElementById("frmDatos");
        const http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.send(new FormData(frm));
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                const res = JSON.parse(this.responseText);
                alertas(res.msg, res.icono);
            }
        }
    }
}
function generarPdfInventario() {
    const desde = document.getElementById('min').value;
    const hasta = document.getElementById('max').value;
    if (desde > hasta) {
        alertas('Fecha Incorrecta, la fecha desde no puede ser mayor a hasta', 'warning');
        return false;
    } else {
        let timerInterval, url;
        Swal.fire({
            title: 'Generando reporte',
            html: 'Procesando <b></b> milisegundos.',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading()
                const b = Swal.getHtmlContainer().querySelector('b')
                timerInterval = setInterval(() => {
                    b.textContent = Swal.getTimerLeft()
                }, 100)
            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (desde == '' || hasta == '') {
                    url = base_url + 'Productos/pdfInventario/all';
                } else {
                    url = base_url + 'Productos/pdfInventario/' + desde + '/' + hasta;
                }
                window.open(url);
            }
        })
    }
}
function generarPdfCompra() {
    const desde = document.getElementById('min').value;
    const hasta = document.getElementById('max').value;
    if (desde > hasta) {
        alertas('Fecha Incorrecta, la fecha desde no puede ser mayor a hasta', 'warning');
        return false;
    } else {
        let timerInterval, url;
        Swal.fire({
            title: 'Generando reporte',
            html: 'Procesando <b></b> milisegundos.',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading()
                const b = Swal.getHtmlContainer().querySelector('b')
                timerInterval = setInterval(() => {
                    b.textContent = Swal.getTimerLeft()
                }, 100)
            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (desde == '' || hasta == '') {
                    url = base_url + 'Productos/pdfCompra/all';
                } else {
                    url = base_url + 'Productos/pdfCompra/' + desde + '/' + hasta;
                }
                window.open(url);
            }
        })
    }
}
function generarPdfVenta() {
    const desde = document.getElementById('min').value;
    const hasta = document.getElementById('max').value;
    if (desde > hasta) {
        alertas('Fecha Incorrecta, la fecha desde no puede ser mayor a hasta', 'warning');
        return false;
    } else {
        let timerInterval, url;
        Swal.fire({
            title: 'Generando reporte',
            html: 'Procesando <b></b> milisegundos.',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading()
                const b = Swal.getHtmlContainer().querySelector('b')
                timerInterval = setInterval(() => {
                    b.textContent = Swal.getTimerLeft()
                }, 100)
            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (desde == '' || hasta == '') {
                    url = base_url + 'Productos/pdfVenta/all';
                } else {
                    url = base_url + 'Productos/pdfVenta/' + desde + '/' + hasta;
                }
                window.open(url);
            }
        })
    }
}
function pagarCon(e) {
    const total = document.getElementById('total').textContent;
    let c_total = parseFloat(total) - parseFloat(e.target.value);
	document.getElementById('cambio').value = c_total.toFixed(2);
    if (parseFloat(e.target.value) >= total) {
        document.getElementById('procesarVenta').classList.remove('d-none');
    } else {
        document.getElementById('procesarVenta').classList.add('d-none');
    }
}
function anularVenta(e) {
    let fila = document.querySelectorAll("#detalle_ tr").length;
    if (fila < 2) {
        alertas('La tabla esta vacia', 'warning');
        return false;
    } else {
       Swal.fire({
           title: 'Esta seguro de anular el proceso?',
           icon: 'warning',
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           cancelButtonColor: '#d33',
           confirmButtonText: 'Si!',
           cancelButtonText: 'No'
       }).then((result) => {
           if (result.isConfirmed) {
               let url;
               if (e.target.name == 'anularVenta') {
                   url = base_url + 'Compras/anularProceso/detalle_temp';
               } else {
                   url = base_url + 'Compras/anularProceso/detalle';
               }
               const http = new XMLHttpRequest();
               http.open("GET", url, true);
               http.send();
               http.onreadystatechange = function () {
                   if (this.readyState == 4 && this.status == 200) {
                       const res = JSON.parse(this.responseText);
                       alertas(res.msg, res.icono);
                       document.getElementById('cambio').value = '';
                       document.getElementById('pagar_con').value = '';
                       if (e.target.name == 'anularVenta') {
                           cargarDetalleVenta();
                       } else {
                           cargarDetalle();
                       }
                   }
               }
           }
       })
    }
}
function actualizarGrafico() {
    const anio = document.getElementById('year').value;
    let ctx = document.getElementById('ventas_mes').getContext('2d');
    if (myChart) {
        myChart.destroy();
    }
    const url = base_url + 'Administracion/actualizarGrafico/' + anio;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    datasets: [{
                        label: 'Ventas por Mes',
                        data: [res.ene, res.feb, res.mar, res.abr, res.may, res.jun, res.jul, res.ago, res.sep, res.oct, res.nov, res.dic],
                        backgroundColor: [
                            'rgba(13, 202, 240, 0.8)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}
function actualizarGraficoCompra() {
    const anio = document.getElementById('year').value;
    let ctx = document.getElementById('compras_mes').getContext('2d');
    if (myChart_) {
        myChart_.destroy();
    }
    const url = base_url + 'Administracion/actualizarGraficoCompra/' + anio;
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            myChart_ = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    datasets: [{
                        label: 'Ventas por Mes',
                        data: [res.ene, res.feb, res.mar, res.abr, res.may, res.jun, res.jul, res.ago, res.sep, res.oct, res.nov, res.dic],
                        backgroundColor: [
                            'rgba(13, 0, 240, 0.8)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}
function reporteStock() {
    const url = base_url + 'Administracion/reporteStock';
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            let nombre = [];
            let cantidad = [];
            for (let i = 0; i < res.length; i++) {
                nombre.push(res[i]['descripcion']);
                cantidad.push(res[i]['cantidad']);
            }
            var ctx = document.getElementById("stockMinimo");
            var myPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: nombre,
                    datasets: [{
                        data: cantidad,
                        backgroundColor: ['#024A86', '#E7D40A', '#581845', '#C82A54', '#EF280F', '#8C4966', '#FF689D', '#E36B2C', '#69C36D', '#23BAC4'],
                    }],
                },
            });
        }
    }
}
function topProductos() {
    const url = base_url + 'Administracion/topProductos';
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            let nombre = [];
            let cantidad = [];
            for (let i = 0; i < res.length; i++) {
                nombre.push(res[i]['descripcion']);
                cantidad.push(res[i]['cantidad']);
            }
            var ctx = document.getElementById("topProductos");
            var myPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: nombre,
                    datasets: [{
                        data: cantidad,
                        backgroundColor: ['#C82A54', '#69C36D', '#EF280F', '#E7D40A', '#581845', '#8C4966', '#FF689D', '#024A86', '#E36B2C', '#23BAC4'],
                    }],
                },
            });
        }
    }
}
function editarPerfil(){
    document.getElementById('editarPerfil').classList.remove('d-none');
}