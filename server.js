import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb://gazigroupadmin_db_user:Gazi_Admin_2026@cluster0-shard-00-00.2chh7au.mongodb.net:27017/rkmoney?ssl=true&authSource=admin";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✓ MongoDB Cloud Database Connected Successfully!"))
  .catch((err) => console.error("Database Connection Error:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  tier: { type: String, default: "Free" },
  joined: { type: Date, default: Date.now }
});

const UserModel = mongoose.model("User", UserSchema);

// 🔄 API ROUTE A: FETCH ALL REGISTERED SYSTEM USERS
app.get("/api/users", async (req, res) => {
  try {
    const allUsers = await UserModel.find({}, { password: 0 });
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔄 API ROUTE B: SUPER ADMIN SYSTEM TIER MODIFICATION NODE
app.post("/api/users/update-tier", async (req, res) => {
  const { email, tier } = req.body;
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { tier: tier },
      { new: true }
    );
    res.status(200).json({ message: "Tier update committed", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Failed to rewrite token" });
  }
});

// 🔄 API ROUTE C: LIVE REGISTRATION ACCESS DATA GATEWAY
app.post("/api/auth/register", async (req, res) => {
  const { email, name, password, tier } = req.body;
  try {
    const newUser = new UserModel({
      email: email.toLowerCase().trim(),
      name,
      password,
      tier: tier || "Free"
    });
    await newUser.save();
    res.status(201).json({ message: "Account setup committed successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Bhai, yeh email pehle se live node par exist hai!" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GAZI GROUP SERVER RUNNING LIVE ON PORT ${PORT}`);
});