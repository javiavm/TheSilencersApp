// Pobla DB con categorías base, usuario admin, post de bienvenida y recursos demo.
import { PrismaClient, Role, PostType, ResourceCategory, Game } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

function slug(input: string) {
  return slugify(input, { lower: true, strict: true });
}

async function main() {
  console.log('▶ Seeding database...');

  const categories = [
    { name: 'Guías', icon: '📖' },
    { name: 'Mods', icon: '🧩' },
    { name: 'Plugins', icon: '🔌' },
    { name: 'Builds', icon: '🏛️' },
    { name: 'Noticias', icon: '📰' },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: slug(c.name) },
      update: {},
      create: { name: c.name, slug: slug(c.name), icon: c.icon },
    });
  }

  const admin = await prisma.user.upsert({
    where: { username: process.env.SEED_ADMIN_USERNAME ?? 'admin' },
    update: { role: Role.ADMIN },
    create: {
      username: process.env.SEED_ADMIN_USERNAME ?? 'admin',
      email: 'admin@the-silencers.local',
      role: Role.ADMIN,
      discordId: process.env.SEED_ADMIN_DISCORD_ID ?? null,
      bio: 'Cuenta administradora de The Silencers.',
    },
  });

  await prisma.post.upsert({
    where: { slug: 'bienvenidos-a-the-silencers' },
    update: {},
    create: {
      title: 'Bienvenidos a The Silencers',
      slug: 'bienvenidos-a-the-silencers',
      excerpt: 'La comunidad gamer hispanohablante tiene un nuevo hogar.',
      type: PostType.ANNOUNCEMENT,
      tags: ['bienvenida', 'comunidad'],
      published: true,
      publishedAt: new Date(),
      authorId: admin.id,
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Hola, gamers 👋' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'The Silencers nace para centralizar guías, mods, plugins y servidores en un solo lugar. Esto es solo el comienzo.',
              },
            ],
          },
        ],
      },
    },
  });

  const demoResources: Array<{
    title: string;
    description: string;
    category: ResourceCategory;
    game: Game;
    version?: string;
  }> = [
    {
      title: 'Pack de comandos esenciales para tu bot',
      description:
        'Comandos slash listos para usar con discord.js v14: moderación, info de servidor, utilidades y stats.',
      category: ResourceCategory.GUIDE,
      game: Game.DISCORD_BOT,
      version: '1.0.0',
    },
    {
      title: 'OptiMine — mod de optimización para 1.20',
      description:
        'Mejora el rendimiento de tu cliente y servidor de Minecraft 1.20 sin perder mods. Compatible con Forge y Fabric.',
      category: ResourceCategory.MOD,
      game: Game.MINECRAFT,
      version: '0.4.2',
    },
    {
      title: 'Plugin de economía con tiendas',
      description:
        'Sistema de economía con tiendas físicas, monedas configurables y soporte para Vault. Para servidores Spigot/Paper.',
      category: ResourceCategory.PLUGIN,
      game: Game.MINECRAFT,
    },
  ];

  for (const r of demoResources) {
    await prisma.resource.upsert({
      where: { slug: slug(r.title) },
      update: {},
      create: {
        title: r.title,
        slug: slug(r.title),
        description: r.description,
        category: r.category,
        game: r.game,
        version: r.version ?? null,
        published: true,
        authorId: admin.id,
      },
    });
  }

  console.log('✓ Seed completo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
