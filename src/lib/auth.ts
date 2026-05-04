// Configuración de NextAuth: Discord OAuth + JWT con role para autorizar /admin.
import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import DiscordProvider from 'next-auth/providers/discord';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { Role } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: 'identify email' } },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? Role.USER;
      }
      if (trigger === 'update' || (token.id && !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? Role.USER;
      }
      return session;
    },
  },
  events: {
    // Rellena username/avatarUrl/discordId tras el create del adapter.
    async createUser({ user }) {
      const base =
        (user.name ?? user.email?.split('@')[0] ?? 'gamer')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 20) || 'gamer';

      let candidate = base;
      let i = 1;
      while (
        await prisma.user.findFirst({
          where: { username: candidate, NOT: { id: user.id } },
          select: { id: true },
        })
      ) {
        candidate = `${base}-${i++}`;
      }

      const discordAccount = await prisma.account.findFirst({
        where: { userId: user.id, provider: 'discord' },
        select: { providerAccountId: true },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          username: candidate,
          avatarUrl: user.image ?? undefined,
          discordId: discordAccount?.providerAccountId ?? undefined,
        },
      });
    },
  },
};
