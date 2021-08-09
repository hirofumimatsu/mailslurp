// pg_queue

// documentation via: haraka -c /Users/hirofumimatsu/work/mailslurp/receive-mail/haraka_test -h plugins/pg_queue

// Put your plugin code here
// type: `haraka -h Plugins` for documentation on how to create a plugin
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const util = require("util");

exports.hook_data = function (next, connection) {
  // enable mail body parsing
  connection.transaction.parse_body = true;
  next();
};

exports.register = function () {
  const plugin = this;
  plugin.register_hook("queue", "pg_queue");
};

exports.pg_queue = async function (next, connection, params) {
  const plugin = this;
  const txn = connection.transaction;

  //const body = txn.message_stream.pipe(new transformstream());
  //plugin.loginfo(util.inspect(connection));
  //plugin.loginfo(util.inspect(txn));
  //plugin.loginfo(util.inspect(txn.mail_from));
  //plugin.loginfo(util.inspect(txn.rcpt_to));
  //plugin.loginfo(util.inspect(txn.header.headers_decoded));
  //plugin.loginfo(util.inspect(txn.body.header.headers.subject[0]));

  // rcpt toの取得
  const emailto = txn.rcpt_to;

  // ヘッダの取得
  const headers = txn.body.header.headers;
  plugin.loginfo(util.inspect(headers));
  const subject =
    typeof headers.subject !== "undefined" ? headers.subject[0] : "";
  const to = typeof headers.to !== "undefined" ? headers.to[0] : "";
  const from = typeof headers.from !== "undefined" ? headers.from[0] : "";
  let date = typeof headers.date !== "undefined" ? headers.date[0] : Date();
  date = Date.parse(date).toString();
  const body = txn.body.bodytext ?? "";

  const mailbox = await prisma.mailbox.findUnique({
    where: {
      email: emailto[0].user + "@" + emailto[0].host,
    },
  });
  if (mailbox) {
    await prisma.message.create({
      data: {
        subject: subject,
        from: from,
        to: to,
        date: date,
        body: body,
        mailboxId: mailbox.id,
      },
    });
    next(OK, "email accepted.");
  } else {
    next(DENYDISCONNECT);
  }
};

exports.shutdown = function () {
  this.loginfo("shutting down queue plugin.");
};
