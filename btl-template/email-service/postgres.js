const { Pool } = require("pg");

class PostgresHelper {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString: connectionString,
      max: 2, // Limit pool size to 2 connections
    });
  }

  async begin(client) {
    await client.query("BEGIN;");
    console.log("TRANSACTION STARTED");
  }

  async commit(client) {
    await client.query("COMMIT;");
    console.log("TRANSACTION COMMITED");
  }

  async rollback(client) {
    await client.query("ROLLBACK;");
    console.log("TRANSACTION ROLLBACK");
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log("Connected to PostgreSQL using connection pool");
      return client;
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error);
      throw error;
    }
  }

  async disconnect(client) {
    try {
      client.release(); // Release the client back to the pool
      console.log("Released connection back to pool");
    } catch (error) {
      console.error("Error releasing connection back to pool:", error);
    }
  }

  async query(text, params, client) {
    console.log(text, params);
    try {
      const result = await client.query(text, params);
      return result.rows;
    } catch (error) {
      // console.error('Error executing query:', error);
      throw error;
    }
  }

  async create(table, data, client) {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

    try {
      const result = await this.query(query, values, client);
      return result[0];
    } catch (error) {
      console.error("Error creating record:", error);
      throw error;
    }
  }

  async read(table, condition = "", params = [], client) {
    const query = `SELECT * FROM ${table} ${
      condition ? `WHERE ${condition}` : ""
    }`;
    try {
      return await this.query(query, params, client);
    } catch (error) {
      console.error("Error reading records:", error);
      throw error;
    }
  }

  async update(table, idColumn, id, data, client) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setValues = columns
      .map((col, i) => `"${col}" = $${i + 1}`)
      .join(", ");

    const query = `UPDATE ${table} SET ${setValues} WHERE "${idColumn}" = $${
      columns.length + 1
    } RETURNING *`;

    try {
      const result = await this.query(query, [...values, id], client);
      return result[0];
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  }

  async delete(table, id, client) {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;

    try {
      const result = await this.query(query, [id], client);
      return result[0];
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  }
}

module.exports = { PostgresHelper };
