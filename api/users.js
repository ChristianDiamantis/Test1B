const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { email, password } = req.body;
    try {
      const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

      if (checkUser.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const result = await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, password]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Registration failed" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
