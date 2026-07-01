import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const MOVIES_FILE_PATH = path.join(__dirname, "src", "movies.json");
const BOOKINGS_FILE_PATH = path.join(__dirname, "src", "bookings.json");

// Helper to read JSON safely
const readJsonFile = (filePath: string, defaultValue: any) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultValue;
  }
};

// Helper to write JSON safely
const writeJsonFile = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// --- API Endpoints ---

// Get all movies
app.get("/api/movies", (req, res) => {
  const movies = readJsonFile(MOVIES_FILE_PATH, []);
  res.json(movies);
});

// Add a movie
app.post("/api/movies", (req, res) => {
  const movies = readJsonFile(MOVIES_FILE_PATH, []);
  const newMovie = req.body;
  
  if (!newMovie.id || !newMovie.title) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  movies.push(newMovie);
  writeJsonFile(MOVIES_FILE_PATH, movies);
  res.status(201).json(newMovie);
});

// Update a movie
app.put("/api/movies/:id", (req, res) => {
  const movies = readJsonFile(MOVIES_FILE_PATH, []);
  const movieId = req.params.id;
  const updatedMovie = req.body;

  const index = movies.findIndex((m: any) => m.id === movieId);
  if (index === -1) {
    return res.status(404).json({ error: "Movie not found" });
  }

  movies[index] = { ...movies[index], ...updatedMovie };
  writeJsonFile(MOVIES_FILE_PATH, movies);
  res.json(movies[index]);
});

// Delete a movie (This deletes permanently from the json code file!)
app.delete("/api/movies/:id", (req, res) => {
  const movies = readJsonFile(MOVIES_FILE_PATH, []);
  const movieId = req.params.id;

  const filteredMovies = movies.filter((m: any) => m.id !== movieId);
  if (movies.length === filteredMovies.length) {
    return res.status(404).json({ error: "Movie not found" });
  }

  writeJsonFile(MOVIES_FILE_PATH, filteredMovies);
  res.json({ message: "Movie deleted permanently", id: movieId });
});

// Get all bookings
app.get("/api/bookings", (req, res) => {
  const bookings = readJsonFile(BOOKINGS_FILE_PATH, []);
  res.json(bookings);
});

// Add a booking
app.post("/api/bookings", (req, res) => {
  const bookings = readJsonFile(BOOKINGS_FILE_PATH, []);
  const newBooking = req.body;

  if (!newBooking.referenceNumber) {
    return res.status(400).json({ error: "Missing reference number" });
  }

  bookings.unshift(newBooking);
  writeJsonFile(BOOKINGS_FILE_PATH, bookings);
  res.status(201).json(newBooking);
});

// Vite Integration Middleware
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*all", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
