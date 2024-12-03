import express from "express";
import { writeFile, readFile } from "node:fs/promises";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import cors from "cors";

const app = express();
const repertorioFilePath = "repertorio.json"; // Cambiado a repertorio.json

// Middleware para parsear el cuerpo de las peticiones
app.use(bodyParser.json());
app.use(cors());

// Función para obtener las canciones
const getCanciones = async () => {
  const fsResponse = await readFile(repertorioFilePath, "utf-8");
  const canciones = JSON.parse(fsResponse);
  return canciones;
};

// GET: Obtener todas las canciones
app.get("/canciones", async (req, res) => {
  const canciones = await getCanciones();
  res.json(canciones);
});

// POST: Agregar una nueva canción
app.post("/canciones", async (req, res) => {
  const { titulo, artista, tono } = req.body;
  const newCancion = {
    id: nanoid(),
    titulo,
    artista,
    tono,
  };
  let canciones = await getCanciones();
  canciones.push(newCancion);
  await writeFile(repertorioFilePath, JSON.stringify(canciones));
  res.status(201).json(newCancion);
});

// DELETE: Eliminar una canción
app.delete("/canciones/:id", async (req, res) => {
  const id = req.params.id;
  let canciones = await getCanciones();
  const cancion = canciones.find(c => c.id === id);

  if (!cancion) {
    return res.status(404).json({ message: "Canción no encontrada" });
  }

  canciones = canciones.filter(c => c.id !== id);
  await writeFile(repertorioFilePath, JSON.stringify(canciones));
  res.json(canciones);
});

app.listen(5000, () => {
  console.log("Server corriendo en el puerto 5000");
});
// PUT: Editar una canción
app.put("/cancionea/:id", async (req, res) => {
  const id = req.params.id;
  let canciones = await getCanciones();
  const cancionIndex = canciones.findIndex(c => c.id === id);

  if (cancionIndex === -1) {
    return res.status(404).json({ message: "Canción no encontrada" });
  }

  // Actualizar la canción con los nuevos datos
  canciones[cancionIndex] = {
    ...canciones[cancionIndex],
    ...req.body // Actualizar con los datos del cuerpo de la solicitud
  };

  await writeFile(repertorioFilePath, JSON.stringify(canciones));
  res.json(canciones[cancionIndex]); // Devolver la canción actualizada
});

// Devolvemos pag para una consulta GET (Req.2)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});