const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("../utils/logger");

const debitTemplate = require("../templates/debit.template");
const creditTemplate = require("../templates/credit.template");
const pendingTemplate = require("../templates/pending.template");
const failedTemplate = require("../templates/failed.template");

const templates = {
  DEBIT: debitTemplate,
  CREDIT: creditTemplate,
  PENDING: pendingTemplate,
  FAILED: failedTemplate,
};

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

const sendTransactionEmail = async ({ type, to, ...data }) => {
  const buildTemplate = templates[type];
  if (!buildTemplate) {
    throw new Error(`Unknown email template type: ${type}`);
  }

  const { subject, html } = buildTemplate(data);

  const info = await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
  });

  logger.info(`Email sent [${type}] to ${to} - messageId: ${info.messageId}`);
  return info;
};

module.exports = { sendTransactionEmail };
