const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: "root",
  password: "kaito1234",   
  database: "Database",    
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

app.post("/transactions", (req, res) => {
  const { type, title, amount, transaction_date, transaction_time } = req.body;

  const query = `
    INSERT INTO transactions (type, title, amount, transaction_date, transaction_time) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [type, title, amount, transaction_date, transaction_time], (err, result) => {
    if (err) {
      console.error("Error inserting transaction:", err);
      return res.status(500).send("Error adding transaction");
    }

    const newId = result.insertId;
    db.query("SELECT * FROM transactions WHERE id = ?", [newId], (err, rows) => {
      if (err) {
        return res.status(500).send("Error retrieving transaction");
      }
      res.status(201).json(rows[0]);
    });
  });
});

app.get("/transactions", (req, res) => {
  const selectQuery = `SELECT * FROM transactions ORDER BY transaction_date DESC, transaction_time DESC`;
  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      return res.status(500).send("Error fetching transactions");
    }
    res.json(results);
  });
});

app.put("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { type, title, amount, transaction_date, transaction_time } = req.body;


  const updateQuery = `
    UPDATE transactions 
    SET type = ?, title = ?, amount = ?, transaction_date = ?, transaction_time = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  db.query(updateQuery, [type, title, amount, transaction_date, transaction_time, id], (err, result) => {
    if (err) {
      console.error("Error updating transaction:", err);
      return res.status(500).send("Error updating transaction");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Transaction not found");
    }

    db.query("SELECT * FROM transactions WHERE id = ?", [id], (err, rows) => {
      if (err) {
        return res.status(500).send("Error retrieving updated transaction");
      }
      res.json(rows[0]);
    });
  });
});


app.delete("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const deleteQuery = `DELETE FROM transactions WHERE id = ?`;

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      return res.status(500).send("Error deleting transaction");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Transaction not found");
    }

    res.send("Transaction deleted");
  });
});

app.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});
