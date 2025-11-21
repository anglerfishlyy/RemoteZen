import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@remotezen.dev";
  const adminPassword = "AdminPass123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "RemoteZen Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  const team = await prisma.team.upsert({
    where: { id: "demo-team-singleton" },
    update: {},
    create: {
      id: "demo-team-singleton",
      name: "Demo Team",
    },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: admin.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: admin.id,
      role: "ADMIN",
    },
  });

  console.log("Seed completed.", { admin: { email: admin.email }, team: { id: team.id, name: team.name } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



