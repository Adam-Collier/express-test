import express from "express";
import RateLimit from "express-rate-limit";

import dotenv from "dotenv";
import { client } from "./db/index.js";
dotenv.config();

const app = express();

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

app.use(express.json());
app.use(limiter);
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/query", async (req, res) => {
  if (!req.body) {
    console.log("error: missing body");
    return res.status(400).json({ error: "missing body" });
  }

  const { sql, params, method } = req.body;

  if (!sql || !method || !params) {
    console.log("error: missing sql, method, or params");
    return res.status(400).json({ error: "missing sql, method, or params" });
  }

  // prevent multiple queries
  const sqlBody = sql?.replace(/;/g, "");

  if (!sqlBody) {
    return res.status(400).json({ error: "no sqlBody found" });
  }

  if (method === "all") {
    try {
      const result = await client.query({
        text: sqlBody,
        values: params,
        rowMode: "array",
      });
      return res.send(result.rows);
    } catch (e) {
      console.log("error from all query", e);
      return res.status(500).json({ error: e });
    }
  } else if (method === "execute") {
    try {
      const result = await client.query({
        text: sqlBody,
        values: params,
      });

      console.log({ result }, "execute");

      return res.send(result.rows);
    } catch (e) {
      console.log("error from execute query", e);
      return res.status(500).json({ error: e });
    }
  } else {
    return res.status(500).json({ error: "Unknown method value" });
  }
});

// app.post("/migrate", async (req, res) => {
//   const { queries } = req.body;

//   await client.query("BEGIN");
//   try {
//     for (const query of queries) {
//       await client.query(query);
//     }
//     await client.query("COMMIT");
//   } catch {
//     await client.query("ROLLBACK");
//   }

//   return res.send({});
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
