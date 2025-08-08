require("dotenv").config();
const nodemailer = require("nodemailer");
const { PostgresHelper } = require("./postgres");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const emailConstant = {
  email: {
    host: `${process.env.EMAIL_HOST}`.trim(),
    port: Number(`${process.env.EMAIL_PORT}`.trim()),
    secure: true,
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
    ignoreTLS: false,
    auth: {
      user: `${process.env.EMAIL_USER}`.trim(),
      pass: `${process.env.EMAIL_PASS}`.trim(),
    },
  },
  sender: `${process.env.EMAIL_SENDER}`.trim(),
};

const awsConfig = {
  bucket: `${process.env.ATTACHMENT_S3_BUCKET}`.trim(),
  region: `${process.env.APP_AWS_REGION}`.trim(),
  secret: `${process.env.APP_AWS_SECRET_ACCESS_KEY}`.trim(),
  keyID: `${process.env.APP_AWS_ACCESS_KEY_ID}`.trim(),
  accountID: `${process.env.APP_AWS_ACCOUNT_ID}`.trim(),
};

const emailStatus = {
  pending: 0,
  processing: 1,
  completed: 2,
  failed: 3,
};

async function getContent(filename) {
  try {
    const client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.keyID,
        secretAccessKey: awsConfig.secret,
      },
    });
    const input = {
      Bucket: awsConfig.bucket,
      Key: filename,
      ResponseContentEncoding: "identity",
      ResponseContentDisposition: "inline",
    };
    const command = new GetObjectCommand(input);
    const s3GetObjectResponse = await client.send(command);
    const base64Content = await s3GetObjectResponse.Body.transformToString(
      "utf-8"
    );
    // Return the decoded text content
    return base64Content;
  } catch (error) {
    console.error("Error generating Presigned URL:", error);
    throw new Error("Error generating Presigned URL");
  }
}

/**
 * Sends an email to the specified email ID.
 * @param {string} emailId - The email ID of the recipient.
 * @param {PostgresHelper} postgres - The PostgreSQL client instance or database connection.
 * @returns {Promise<any>} - Resolves when the email is sent.
 */
const sendEmail = async (emailId, postgres, clientConnectionPool) => {
  let notificationsData;

  try {
    // find email with emailId;
    const result = await postgres.read("notifications", "id=$1", [
      emailId,
    ], clientConnectionPool);
    notificationsData = result[0];
    if(!notificationsData) return false;
    await postgres.update("notifications", "id", emailId, {
      status: emailStatus.processing,
    }, clientConnectionPool);

    // format email attachement
    const attachments = [];
    if (notificationsData && notificationsData.attachments && notificationsData.attachments.length > 0) {
      for (const attachment of notificationsData.attachments) {
        // get file data
        const content = await getContent(attachment.path);

        // set attachment for file
        attachments.push({
          filename: attachment.filename,
          content: content,
          encoding: attachment.encoding,
        });
      }
    }

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(emailConstant.email);
    // send mail with defined transport object
    const info = transporter.sendMail({
      from: notificationsData.from, // sender address
      to: notificationsData.to, // list of receivers
      subject: notificationsData.subject, // Subject line
      text: notificationsData.text, // plain text body
      html: notificationsData.html, // html body
      attachments: attachments.length > 0 ? attachments : null, // attachments array
    });
    console.log("Message sent: %s", info);
    try {
      await postgres.update("notifications", "id", emailId, {
        status: emailStatus.completed,
      }, clientConnectionPool);
    } catch (e) {
      console.log("EMAIL WITH ID " + emailId + " NOT FOUND");
    }
    console.log("MAIL SENT AND UPDATED STATUS CORRECTLY");
    return info;
  } catch (e) {
    console.log("ERROR: ", e);
    if (emailId) {
      await postgres.update("notifications", "id", emailId, {
        status: emailStatus.failed,
      }, clientConnectionPool);
    }
    return null;
  }
};

module.exports = {sendEmail};
