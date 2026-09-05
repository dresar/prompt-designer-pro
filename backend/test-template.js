import prisma from "./lib/prisma.js";

async function main() {
  const slugOrId = "programming-template-8";
  const template = await prisma.promptTemplate.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      deletedAt: null,
    },
    include: {
      category: { select: { id: true, name: true, slug: true, icon: true } },
    },
  });
  console.log("DB Result:", template);
}

main().catch(console.error).finally(() => prisma.$disconnect());
