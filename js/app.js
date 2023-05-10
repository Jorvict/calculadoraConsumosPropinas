/* 
    En desarrollo a veces el backend puede tardar en generar las APIs de
    las DB, en esos casos el front puede generar una API "dummy" con la cual
    poder usar de maqueta y avanzar el desarrollo del front para que una vez el
    back culmine el desarrollo de la API simplemente sustituyen los endpoints
*/
/* 
    json-server --watch db.json --port 4000 utilizar en la
    terminal con la ruta donde se encuentra el archivo para
    ejecutar el servidor json con la DB seleccionada en el
    puerto indicado, si se utiliza una ruta incorrecta
    json-server puede generar una db distinta
*/ 

let cliente = {
    mesa : '',
    hora : '',
    pedido : []
};

const categorias = {
    1 : 'Comida',
    2 : 'Bebidas',
    3 : 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){

    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Revisar si hay campos vacios
    // Some verifica si al menos uno de los campos cumpla con la condición
    // En este caso si algunos de los campos está vacío retornará un true
    const camposVacios = [ mesa, hora].some( campo => campo === '');

    if(camposVacios){

        // Verificar sí ya hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta){
            
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';

            document.querySelector('.modal-body form').appendChild(alerta);
    
            setTimeout(() => {
                alerta.remove();
            }, 2000);

        }
        
        return;
    }

    // Asignar datos del formulario a cliente
    /*
        El objeto de cliente va a quedar vacío sí asignamos la copia 
        del objeto original de último puesto, ya que se van a sobreescribir
        los valores de mesa y hora obtenidos de los inputs con los valores
        del objeto copiado, para evitar esto se sugiere que el objeto a copiar
        vaya de primero en éste caso, así se traera la copia del objeto vacío
        y se sobreescribiran los values vacíos con el valor de los inputs.
        Sí no obtenemos la copia del objeto original lo que va a suceder es
        que el nuevo objeto de cliente se va a sobreescribir sin la referencia
        del array de pedido.     
    */ 
    cliente = { ...cliente, mesa, hora };


    // Ocultar Modal
    const modalformulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalformulario);
    modalBootstrap.hide();


    // Mostrar las secciones
    mostrarSecciones();

    // Obtener Platillos de la API de JSON-Server
    obtenerPlatillos();
}

function mostrarSecciones(){

    const seccionesOcultas = document.querySelectorAll('.d-none');

    seccionesOcultas.forEach(seccion => {
        
        // Recordar que al usar el classList.remove no se escribe como selector
        // sino que se escribe la clase directamente (sin el . inicial) 
        seccion.classList.remove('d-none'); 
    });
}

function obtenerPlatillos(){

    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then( respuesta => respuesta.json() )
        .then( resultado => mostrarPlatillos(resultado) )
        .catch( error => console.log(error))
}

function mostrarPlatillos(platillos){

    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( platillo => {

        const { nombre, precio, categoria, id } = platillo

        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const nombreDiv = document.createElement('DIV');
        nombreDiv.classList.add('col-md-4'); 
        nombreDiv.textContent = nombre;

        const precioDiv = document.createElement('DIV');
        precioDiv.classList.add('col-md-3', 'fw-bold'); // font weight bold
        precioDiv.textContent = `$${precio}`;

        const categoriaDiv = document.createElement('DIV');
        categoriaDiv.classList.add('col-md-3'); 
        categoriaDiv.textContent = categorias[categoria];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${id}`;
        inputCantidad.classList.add('form-control');
        
        // Función que detecta la cantidad y el platillo que se está agregando
        inputCantidad.onchange = () =>{
            const cantidad = parseInt( inputCantidad.value );
            agregarPlatillo({...platillo, cantidad});
        }
        
        const agregarDiv = document.createElement('DIV');
        agregarDiv.classList.add('col-md-2');
        agregarDiv.appendChild(inputCantidad);

        row.appendChild(nombreDiv);
        row.appendChild(precioDiv);
        row.appendChild(categoriaDiv);
        row.appendChild(agregarDiv);


        contenido.appendChild(row);

        /* 
            NOTA: col-md-x se utiliza para estructurar según el grid de 
            bootstrap, los col en total deben sumar 12 que se refiere al 100%
            del tamaño total del elemento padre, tener en cuenta que el
            col-md-x se aplica a los DIVs y no a otros elementos como por
            ejemplo aplicarlo directamente a un input
        */
    });
}

function agregarPlatillo(producto){

    // Extraer el pedido actual en una variable temporal al hacer destructuring
    let { pedido } = cliente;

    // Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0){

        // Comprueba sí el elemento clickeado ya existe en el array
        if(pedido.some( articulo => articulo.id === producto.id )){

            // El artículo ya existe, se procede a actualizar la cantidad
            const pedidoActualizado = pedido.map( articulo => {

                if( articulo.id === producto.id ){
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });

            // Se asigna el nuevo array con la cantidad actualizada al
            // objeto global de cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        
        } else {

        // El artículo no existe, lo agregamos al array del pedido
        /*
            Lo que se realiza a continuación es que el array de pedido
            que es una propiedad del objeto global cliente se sobreescribe 
            con una copia extraida al momento de declarar el destructuring 
            y se le adiciona el producto sobre el cual se hizo click en la
            interfaz de la página, es decir el platillo/item con el que
            se está interactuando. Cabe mencionar que sí modificamos la
            variable pedido obtenida del destructuring no va a afectar al
            objeto global pedido que es propieda de cliente.
        */
            cliente.pedido = [...pedido, producto];
        }

        
    } else{
        
        // Eliminar elementos cuando la cantidad es 0
        // El filter retornará aquellos que son diferentes al que estamos eliminando
        const resultado = pedido.filter( articulo => articulo.id !== producto.id );
        cliente.pedido = [...resultado];
    }

    // Limpiar el código HTML previo
    limpiarHTML();

    // Valida sí hay artículos en el carrito
    if(cliente.pedido.length){

        // Mostrar el Resumen
        actualizarResumen();
    } else {

        // Eliminar el resumen de consumo en caso de que pedido este vacío
        mensajePedidoVacio();
    } 
}

function actualizarResumen(){

    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    // Información de la mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: '
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    // Información de la hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: '
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    // Agregar a los elementos padres (Sus respectivos parrafos(p))
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    // Título de la sección
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center', 'fw-bold');

    // Iterar sobre el array de pedidos
    const lista = document.createElement('UL');
    lista.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {

        const { nombre, cantidad, precio, id } = articulo;

        const listItem = document.createElement('LI');
        listItem.classList.add('list-group-item');
       
        // Nombre del artículo
        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        // Cantidad del artículo
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        // Precio del artículo
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        // Subtotal del artículo
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        // Botón para eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del Pedido';

        // Función para eliminar del pedido
        btnEliminar.onclick = () => {
            eliminarProducto(id);
        };


        // ====== Agregar valores a sus contenedores ======
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        // Agregar Elementos al LI
        listItem.appendChild(nombreEl);
        listItem.appendChild(cantidadEl);
        listItem.appendChild(precioEl);
        listItem.appendChild(subtotalEl);
        listItem.appendChild(btnEliminar);

        // Agregar LI a la lista principal
        lista.appendChild(listItem);
    });

    // Renderizar en el contenido
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(lista);

    contenido.appendChild(resumen);


    // Mostrar formulario de propinas
    formularioPropinas();
}

function limpiarHTML(){

    const contenido = document.querySelector('#resumen .contenido');

    while( contenido.firstChild ){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad){
    return `$${precio * cantidad}`;
}

function eliminarProducto(id){

    const { pedido } = cliente;

    const resultado = pedido.filter( articulo => articulo.id !== id );
    cliente.pedido = [...resultado];

    // Limpiar el código HTML previo
    limpiarHTML();

    // Valida sí hay artículos en el carrito
    if(cliente.pedido.length){

        // Mostrar el Resumen
        actualizarResumen();
    } else {

        // Eliminar el resumen de consumo en caso de que pedido este vacío
        mensajePedidoVacio();
    }

    // El producto se eliminó, se retorna la cantidad a 0 en el formulario
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio(){

    const contenido = document.querySelector('#resumen .contenido');
    
    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);
}

function formularioPropinas(){

    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center', 'fw-bold');
    heading.textContent = 'Propina';

    // ========== RADIO BUTTONS ==========
    // Radio Button 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // Radio Button 25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // Radio Button 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    // Agregar al Div Principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    // Agregarlo al formulario
    formulario.appendChild(divFormulario);

    contenido.appendChild(formulario);
}

function calcularPropina(){

    const { pedido } = cliente;
    let subtotal = 0;

    // Calcular el Subtotal a pagar
    pedido.forEach( articulo => {

        subtotal += articulo.cantidad * articulo.precio;
    });

    // Seleccionar el Radio Button con la propina del cliente
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    // Calcular la propina
    const propina = ( ( subtotal * parseInt(propinaSeleccionada) ) / 100 );

    // Calcular el total
    const total = subtotal + propina;

    imprimirTotalHTML(subtotal, total, propina);
}

function imprimirTotalHTML(subtotal, total, propina){

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar', 'my-5');

    // Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-3');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-3');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    // Total a pagar
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-3');
    totalParrafo.textContent = 'Total a Pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    // Eliminar el ultimo resultado
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv){
        totalPagarDiv.remove();
    }

    // Agregar elementos a div contenedor
    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario > div'); // Selecciona primer div dentro de .formulario
    formulario.appendChild(divTotales);
}