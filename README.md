## _Flujo de Trabajo con Glup_

Flujo de trabajo simple, para utilizar less, livereload y gulp en tus proyectos de 
frontend.


- @author Ramón Chancay Ortega <ramon.chancay@gmail.com>
- @contrib Soda System 

#Dependencias

- NodeJS
- Bower
- Gulp

#Instalacción

```
	> npm install          //instala todas las dependencias de package.json
    > npm install -g gulp  // instala gulp de forma global
```


##Para desarrollo

```
	> gulp               
```

Inicia la tarea "default" se puede invocar de forma implicita "gulp default" con esto se arrancan 
las tareas:

* server  (El servidor por defecto http://localhost:8080/)
* inject  (Inyección de dependencias desde la carpeta stylesheets)
* wiredep (Inyección de dependencias desde bower.json)
* watch   ("Escucha " cambios en los archivos *.styl,*.html,*.js para refrescar la página con livereload)


##Para producción 
```
	gulp build           
```
Inicia la tarea build que a su ves invoca a las tareas:

* compress (Minifica,Comprime el html)
* uncss    (Elimina las clases no utilizadas en el css )