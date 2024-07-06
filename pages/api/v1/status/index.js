import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const result = await database.query("SELECT 1 + 1 as sum;");
  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;"
  );
  const databaseMaxConnectionsValue = parseInt(
    databaseMaxConnectionsResult.rows[0].max_connections
  );

  const databaseName = process.env.POSTGRES_DB;

  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int as opened_connections FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].opened_connections;
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: databaseMaxConnectionsValue,
        opened_connections: databaseOpenedConnectionsValue,
        version: databaseVersionValue,
      },
    },
  });
}

export default status;
