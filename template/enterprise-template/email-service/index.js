const { sendEmail } = require("./notification_service");
const { PostgresHelper } = require("./postgres");

/** @type {Pool | null} */
let clientConnectionPool = null;
/** @type {PostgresHelper | null} */
let postgres = null;

module.exports.runner = async (event, context) => {
  console.log("Running notifications service");
  const connectionString = process.env.CONNECTION_STRING;
  try {
    if (!postgres) {
      postgres = new PostgresHelper(connectionString);
    }
    if (!clientConnectionPool) {
      clientConnectionPool = await postgres.connect();
      console.log("Postgres connection pool established.");
    }

    for (const message of event.Records) {
      console.log("Message", message);
      const body = JSON.parse(message.body);
      const { type } = body;

      switch (type) {
        case "email": {
          const { emailId } = body;
          await sendEmail(emailId, postgres, clientConnectionPool);
          break;
        }

        default: {
          console.log("NOTIFICATION TYPE NOT SUPPORTED");
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
  } finally {
    if (clientConnectionPool) {
      await postgres.disconnect(clientConnectionPool);
      clientConnectionPool = null;
      console.log("Postgres connection pool closed.");
    }
    console.log(
      "*************Running validation service COMPLETED*****************"
    );
  }
};

module.exports.handler = async (event, context) => {
  await this.runner(event, context);
};
