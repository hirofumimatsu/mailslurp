const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  //await prisma.user.create({
  //  data: {
  //    name: "Alice",
  //    email: "alice@prisma.io",
  //  },
  //});
  //
  const allUsers = await prisma.mailbox.findMany({
    where: {
      id: 34,
      userId: 3,
    },
    select: {
      messages: true,
    },
  });
  console.dir(allUsers, { depth: null });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
