// rcpt_to.pg

// documentation via: haraka -c /Users/hirofumimatsu/work/mailslurp/mail-receiver/haraka_test -h plugins/rcpt_to.pg

// Put your plugin code here
// type: `haraka -h Plugins` for documentation on how to create a plugin
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const util = require("util");

exports.register = function () {
  const plugin = this;
};

exports.hook_rcpt = function (next, connection, params) {
  var rcpt = params[0];
  //this.logdebug("param: " + util.inspect(params));
  this.loginfo("checking validity of " + util.inspect(params[0]));

  this.is_user_valid(rcpt, function (isvalid) {
    if (isvalid) {
      connection.loginfo("valid email recipient. continuing...", this);
      next(OK);
    } else {
      connection.loginfo("invalid email recipient. deny email receipt.", this);
      next(DENY, "invalid email address.");
    }
  });
};

exports.is_user_valid = async function (rcpt, callback) {
  const plugin = this;

  // メールボックスの存在確認
  const mailbox = await prisma.mailbox.findUnique({
    where: {
      email: rcpt.user + "@" + rcpt.host,
    },
  });

  // メールボックスの有無を返す
  if (mailbox) {
    return callback(true);
  } else {
    return callback(false);
  }
};

exports.shutdown = function () {
  this.loginfo("shutting down queue plugin.");
};
