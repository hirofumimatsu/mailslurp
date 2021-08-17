const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const hirofumi = await prisma.user.upsert({
    where: { email: "hirofumi@gmail.com" },
    update: {},
    create: {
      email: "hirofumi@gmail.com",
      name: "hirofumi matsumoto",
      password: "password",
      apiKey: "apiKey",
      mailboxes: {
        create: {
          email: "test1@catbot.club",
        },
      },
    },
  });

  console.log({ hirofumi });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
