const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const options = await prisma.generatorOption.findMany({ orderBy: { createdAt: 'asc' } });
  const seen = new Set();
  for (const opt of options) {
    const key = opt.type + ':' + opt.value;
    if (seen.has(key)) {
      await prisma.generatorOption.delete({ where: { id: opt.id } });
      console.log('Deleted duplicate:', key);
    } else {
      seen.add(key);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
