
const indexedDb = window.indexedDB;
const form = document.getElementById('task');
const tasksWrapper = document.getElementById('tasks');

/**
 * verificamos en primer lugar que la indexedDB exista, ya que si no existe 
 * dara un error al no encontrarla, a diferencia des bases de datos no relacionales. 
 */
if (indexedDb && form) {

    let db;
    let dbName = 'tasksList';
    const request = indexedDb.open(dbName, 1);

    /**
     * Uso de los metodos asynchronous que nos da la indexedDB
     */
    
    // onsuccess, verifica si existe la DB y la abre.
    request.onsuccess = () => {

        db = request.result;
        console.log("OPEN", db);

        /**
         * Llamamos la funcion readData una vez la indexedDb este creada.
         */
        readData();
    }

    // onupgradeneeded, verifica si existe la DB, si no, la crea
    request.onupgradeneeded = () => {
        db = request.result;
        console.log("CREATE", db);

        /**
         * creamos la collecion o almacen con el metodo createObjectStore, como parametro pasamos el 
         * nombre de que tendra el almacen o collection seguido de las opciones que tendra como por 
         * ejemplo el autoIncrement para incrementar en uno el indice o Ids del documento creado y 
         * anadido a la collection, o el keyPath para utilizar el titulo como indexed en ves del Ids.
         */

        const objectStore = db.createObjectStore('tasks', {
            // autoIncrement: true
            keyPath: 'taskTitle'
        });
    }

    // onerror, verifica si hay algun error y lo muestra, es dificil que se de el caso
    request.onerror = (error) => {
        console.log(`Error ${error}`);
    }
    

    // Agregar data a la indexedDB
    const addData = (data) => {

        /**
         * Para guardar data requerimos de realizar una transaccion 
         * El primer parametro es el nombre del almacen ['almacen'], el segundo es la accion que 
         * ejectutara, en este caso es la del readwrite para escribir la base de datos.
         */

        const transaction = db.transaction(['tasks'], 'readwrite'); // Devuelve un objeto de tipo transaction
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.add(data);

        // Leemos la collection o almacen de tareas para imprimirlo en el 
        // esto duplica al momento de imprimir la data del almacen en este caso tasks
        readData();
        console.log('Se creo una nueva tarea: ', data.taskTitle);
    }

    /**
     * Buscar data filtrada por la key, nos retorna el value
     * nos devuelve un unico valor con la clave dada, es como un filter
     */
    const getData = (key) => {
        const transaction = db.transaction(['tasks'], 'readwrite'); // Devuelve un objeto de tipo transaction
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.get(key);

        request.onsuccess = () => {
            form.task.value = request.result.taskTitle;
            form.priority.value = request.result.taskPriority;
            form.button.dataset.action = 'update';

            form.button.textContent = ' Update task';
            form.button.removeAttribute('class', 'icofont-plus');
            form.button.setAttribute('class', 'btn btn-primary icofont icofont-refresh');
        }
    }

    // Actualiza data a la indexedDB
    const updateData = (data, disabled) => {

        /**
         * Con el metodo put actualizamos la data existente con la nueva data que se pasa por parametro
         * en caso de que la data sea diferente a la existente entonces el metodo put crea una nueva data
         */

        const transaction = db.transaction(['tasks'], 'readwrite'); // Devuelve un objeto de tipo transaction
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.put(data);
        
        // Le decimos cuando termine cambia el action del button nuevamente a add junto al icono y el textContent
        // e imprime en consola
        request.onsuccess = () => {
            form.button.dataset.action = 'add';
            form.button.textContent = ' Add task';
            form.button.removeAttribute('class')
            form.button.setAttribute('class', 'btn btn-primary icofont icofont-plus')
            console.log('Se ha actualizado la tarea: ', data.taskTitle);

            // Eneable update button
            disabled = false;


            // Leemos la collection o almacen de tareas para imprimirlo en el 
            // esto duplica al momento de imprimir la data del almacen en este caso tasks
            readData();
        }

    }

    const deleteData = (key) => {
        
        const transaction = db.transaction(['tasks'], 'readwrite'); // Devuelve un objeto de tipo transaction
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.delete(key);

        request.onsuccess = () => {
            console.log('Se ha eliminado la tarea: ', key);
            readData();
        }
    }
    
    // Leer la data en la indexedDB
    const readData = () => {

        /**
         * Pala leer la data necesitamos una transaccion utilizando como parametro el almacen o collection
         * y como opcion readonly, si usamos el readwrite igual va a funcionar, luego requerimos ocupar
         * el objectStore sobre el cual vamos a trabajar, por ultimo para leer lo que necesitamos es crear 
         * un cursor el cual va recogiendo cada uno de los objetos de la collection o almacen y devorvien-
         * do ese valor, una vez abierto el cursor debemos de verificar que todo ande bien, como la indexedDb
         * es un proceso asynchornous debemos de leer la misma cuando ya existe y este abierta, por eso
         * llamamos la funcion en el onsuccess, el cursor va leyendo regisgtro a registro y si no le decimos
         * nada solo va a leer un registro
         */

        const transaccion = db.transaction(['tasks'], 'readonly');
        const objectStore = transaccion.objectStore('tasks');
        const request = objectStore.openCursor();
        const fragment = document.createDocumentFragment();

        request.onsuccess = (e) => {

            // Solo lee el primer objeto de la indexedDB
            // console.log(e.target);

            // Leer todos los valores de los registros
            const cursor = e.target.result;
            if ( cursor ) {
                // console.log(cursor.value);
                const div = document.createElement('div');
                div.setAttribute('class', 'box');
                div.style.display = 'flex';
                const taskTitle = document.createElement('p');
                taskTitle.style.width = '50%';
                taskTitle.style.textTransform = 'capitalize';
                taskTitle.textContent = cursor.value.taskTitle;
                div.appendChild(taskTitle);
                const taskPriority = document.createElement('p');
                taskPriority.style.width = '20%';
                taskPriority.style.color = '#AA0000';
                taskPriority.style.fontWeight = 'bold';
                taskPriority.style.textTransform = 'capitalize';
                taskPriority.textContent = cursor.value.taskPriority;
                div.appendChild(taskPriority);
                
                // Boton de actualizar 
                const taskUpdate = document.createElement('BUTTON');
                taskUpdate.dataset.type = 'update';
                taskUpdate.setAttribute('class', 'btn btn-success icofont icofont-refresh');
                taskUpdate.dataset.key = cursor.key;
                taskUpdate.textContent = ' Update';
                div.appendChild(taskUpdate);

                // Boton de eliminar
                const taskDelete = document.createElement('BUTTON');
                taskDelete.dataset.type = 'delete';
                taskDelete.setAttribute('class', 'btn btn-danger icofont icofont-trash');
                taskDelete.dataset.key = cursor.key;
                taskDelete.textContent = ' Delete';
                div.appendChild(taskDelete);
                
                // AGREGA EL DIV AL FRAGMENT PARA LUEGO INCRUSTARLO EN EL DOM
                fragment.appendChild(div);


                // Crea un bucle que recorre el almacen una y otra vez mientras tenga documentos
                // al final si no hay mas documentos pasa al else.
                cursor.continue();
            } else {

                // Para eliminar el almacen y que no imprima duplicado el msimos en el DOM
                // eliminamos el almacen
                tasksWrapper.textContent = '';
                // Agregamos la data al DOM
                tasksWrapper.appendChild(fragment);
                // console.log('No more data...');
                // console.dir(fragment);
            }
        }
    }

    form.addEventListener('submit', (e) => {

        e.preventDefault();

        const data = {
            taskTitle: e.target.task.value.toString().toLowerCase(),
            taskPriority: e.target.priority.value.toString().toLowerCase()
        }

        if( e.target.button.dataset.action == 'add' ) {
            addData(data);
        }else if( e.target.button.dataset.action == 'update') {
            updateData(data);
        }

        form.reset();
        
    });
    
    tasksWrapper.addEventListener('click', (e) => {
        if(e.target.dataset.type == 'update'){
            getData(e.target.dataset.key, e.target.disabled);
            e.target.disabled = true;
        } else if( e.target.dataset.type == 'delete' ){
            deleteData(e.target.dataset.key);
        }
    })

}
