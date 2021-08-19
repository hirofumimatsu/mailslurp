const express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const settings = require("../settings.json");
const { v4: uuidv4 } = require("uuid");
const { json } = require("express");
const status = require("http-status-codes");
const ReasonPhrases = status.ReasonPhrases;
const StatusCodes = status.StatusCodes;
const getReasonPhrase = status.getReasonPhrase;
const getStatusCode = status.getStatusCode;

const buildAPIServer = () => {
  const schema = settings.endpoint.schema;
  const domain = settings.endpoint.domain;
  const port = settings.endpoint.port;
  if (port) {
    return schema + "://" + domain + ":" + port + "/";
  } else {
    return schema + "://" + domain + "/";
  }
};

const buildMailboxesResponse = (mailboxes) => {
  let mailboxArray = [];
  const server = buildAPIServer();

  for (const mailbox of mailboxes) {
    const mailboxItem = {
      mailboxId: mailbox.id,
      email: mailbox.email,
      link: server + "mailboxes/" + mailbox.id,
    };
    mailboxArray.push(mailboxItem);
  }
  return mailboxArray;
};

// メールボックス一覧表示
router.get("/", async function (req, res, next) {
  const mailboxes = await prisma.mailbox.findMany();
  const response = {
    mailboxes: buildMailboxesResponse(mailboxes),
  };
  res.status(StatusCodes.OK).send(response);
});

const createMailbox = async (mailboxId) => {
  const newMailbox = await prisma.mailbox.create({
    data: {
      id: mailboxId,
      email: mailboxId + "@" + emailDomain,
      userId: 1,
    },
  });
};

// メールボックス作成
router.put("/", function (req, res, next) {
  const mailboxId = uuidv4();
  if (createMailbox(mailboxId)) {
    res.status(StatusCodes.CREATED).send({
      mailboxId: mailboxId,
      email: mailboxId + "@" + emailDomain,
      link: server + "mailboxes/" + mailboxId,
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    });
  }
});

// メールボックス詳細表示
router.get("/:id", function (req, res, next) {
  res.send("respond with a resource");
});

// メールボックス削除
router.delete("/:id", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
