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

// メール一覧の応答を作成
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

// メールボックス詳細表示
router.get("/:mailboxId", async function (req, res, next) {
  const server = buildAPIServer();
  const mailbox = prisma.mailbox
    .findUnique({
      where: { id: parseInt(req.params.mailboxId) },
    })
    .then((mailbox) => {
      if (mailbox) {
        res.status(StatusCodes.OK).send({
          mailboxId: mailbox.id,
          email: mailbox.email,
          link: server + "mailboxes/" + mailbox.id,
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).send();
      }
    })
    .catch((error) => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      });
    });
});

// メールボックス一覧表示
router.get("/", async function (req, res, next) {
  try {
    const mailboxes = await prisma.mailbox.findMany();
    const response = {
      mailboxes: buildMailboxesResponse(mailboxes),
    };
    res.status(StatusCodes.OK).send(response);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    });
  }
});

const createMailbox = async () => {
  const uuid = uuidv4();
  const newMailbox = await prisma.mailbox.create({
    data: {
      email: uuid + "@" + settings.emailDomain,
      userId: 1,
    },
  });
  return newMailbox;
};

// メールボックス作成
router.post("/", async function (req, res, next) {
  const uuid = uuidv4();
  const server = buildAPIServer();

  try {
    const newMailbox = await createMailbox();
    res.status(StatusCodes.CREATED).send({
      mailboxId: newMailbox.id,
      email: newMailbox.email,
      link: server + "mailboxes/" + newMailbox.id,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    });
  }
});

// メールボックス削除
router.delete("/:mailboxId", async function (req, res, next) {
  const mailboxId = parseInt(req.params.mailboxId);
  try {
    const mailbox = await prisma.mailbox.findUnique({
      where: { id: mailboxId },
    });
    if (mailbox) {
      await prisma.mailbox
        .update({
          where: { id: mailboxId },
          data: {
            messages: {
              deleteMany: {},
            },
          },
        })
        .then(async (mailbox) => {
          await prisma.mailbox
            .delete({
              where: { id: mailboxId },
            })
            .then((mailbox) => {
              res.status(StatusCodes.OK).send();
            });
        })
        .catch((error) => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
        });
    } else {
      res.status(StatusCodes.NOT_FOUND).send();
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    });
  }
});

module.exports = router;
