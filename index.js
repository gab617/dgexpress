const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const fs = require('fs');

const cnt_gal = require("./data.json")

console.log(cnt_gal.cantidades_imags_categorias)
// Middleware para parsear JSON
app.use(express.json());
app.use(cors());

/* Devuelve archivos de los directorios de las imagenes segun su categoria en la galeria. */
app.get('/archivos-galeria', (req, res) => {
  const directorio = './media/galeria/categorias/'; // Ruta de la carpeta que deseas leer

  fs.readdir(directorio, (err, archivos) => {
    if (err) {
      console.error('Error al leer la carpeta:', err);
      return res.status(500).send('Error al leer la carpeta');
    }

    // Mapeamos los nombres de archivos a promesas de lectura de archivos
    const promesasLectura = archivos.map(archivo => {
      return new Promise((resolve, reject) => {
        fs.readdir(path.join(directorio, archivo), (err, archivosImgs) => {
          if (err) {
            console.error('Error al leer la carpeta:', err);
            return reject(err);
          }

          /* FUNCION DE ORDENAMIENTO, PARA IMAGENES .JPG */
/*           archivosImgs.sort((a, b) => {
            // Obtener el número de la imagen de cada ruta
            let numA = parseInt(a.match(/(\d+)\.jpg$/)[1]);
            let numB = parseInt(b.match(/(\d+)\.jpg$/)[1]);
            // Comparar los números y devolver el resultado
            return numA - numB;
          }); */

          // Construir el array de URLs para cada archivo
          const arrayUrls = archivosImgs.map(nombreImagen => {
            return `/media/galeria/${archivo}/${nombreImagen}`;
          });

          resolve({ [archivo]: arrayUrls });
        });
      });
    });

    // Esperar a que todas las promesas de lectura se resuelvan
    Promise.all(promesasLectura)
      .then(objetos => {
        // Construir el objetoReturn una vez que todas las promesas se hayan resuelto
        const objetoReturn = objetos.reduce((resultado, objeto) => {
          return { ...resultado, ...objeto };
        }, {});

        console.log(objetoReturn);
        res.json(objetoReturn);
      })
      .catch(error => {
        console.error('Error general:', error);
        res.status(500).send('Error interno del servidor');
      });
  });
});




// Ruta genérica
app.get('/api', (req, res) => {
  res.json({ message: '¡Bienvenido a mi API!' });
});
app.get('/api/data', (req, res) => {
  res.json(cnt_gal.cantidades_imags_categorias);
});

app.get('/media/galeria/:categoria/:imageName', (req, res) => {
  const imageName = req.params.imageName; // Obtiene el valor del parámetro de ruta
  const categoria = req.params.categoria
  const imagePath = path.join(__dirname, `/media/galeria/categorias/${categoria}/${imageName}`); // RUTA API
  res.sendFile(imagePath); // Envía el archivo de imagen al cliente
})

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);

});
