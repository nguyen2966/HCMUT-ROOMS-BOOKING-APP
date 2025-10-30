const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = "./db.json";

// Load database into memory
function loadDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

// Save database back to file
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// ---------- LOGIN ----------
app.post("/login", (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  console.log(user)

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Normally you'd return a JWT, but we'll just return user info
  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      role: db.roles.find(r => r.id === user.role_id)?.role_name
    }
  });
});

// ---------- USERS ----------
app.get("/users", (req, res) => {
  const db = loadDB();
  res.json(db.users);
});

// Sign up new user (default to student)
app.post("/users", (req, res) => {
  const db = loadDB();
  const { email, full_name, password } = req.body;

  if (db.users.some(u => u.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const newUser = {
    id: db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
    manager_id: null,
    email,
    full_name,
    password,
    status: "Active",
    role_id: 3 // Default to "Sinh viên"
  };

  db.users.push(newUser);
  saveDB(db);
  res.status(201).json(newUser);
});

// Update or promote users (admin only)
app.patch("/users/:id", (req, res) => {
  const db = loadDB();
  const { role_id, status } = req.body;
  const user = db.users.find(u => u.id === parseInt(req.params.id));

  if (!user) return res.status(404).json({ message: "User not found" });

  // Simulate admin check via header: "x-role-id": 1
  const requesterRole = parseInt(req.headers["x-role-id"]);
  if (requesterRole !== 1)
    return res.status(403).json({ message: "Admin access required" });

  if (role_id) user.role_id = role_id;
  if (status) user.status = status;

  saveDB(db);
  res.json(user);
});

// ---------- ROOMS ----------
app.get("/rooms", (req, res) => {
  const db = loadDB();
  res.json(db.rooms);
});

// Admin-only: create new room
app.post("/rooms", (req, res) => {
  const db = loadDB();
  const requesterRole = parseInt(req.headers["x-role-id"]);
  if (requesterRole !== 1)
    return res.status(403).json({ message: "Admin access required" });

  const newRoom = {
    id: db.rooms.length ? Math.max(...db.rooms.map(r => r.id)) + 1 : 1,
    ...req.body
  };
  db.rooms.push(newRoom);
  saveDB(db);
  res.status(201).json(newRoom);
});

// Admin-only: update room
app.patch("/rooms/:id", (req, res) => {
  const db = loadDB();
  const requesterRole = parseInt(req.headers["x-role-id"]);
  if (requesterRole !== 1)
    return res.status(403).json({ message: "Admin access required" });

  const room = db.rooms.find(r => r.id === parseInt(req.params.id));
  if (!room) return res.status(404).json({ message: "Room not found" });

  Object.assign(room, req.body);
  saveDB(db);
  res.json(room);
});

// ---------- SYSTEM CONFIG ----------
app.get("/system_config", (req, res) => {
  const db = loadDB();
  res.json(db.system_config);
});

// ---------- START SERVER ----------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Express mock API running at http://localhost:${PORT}`);
});
