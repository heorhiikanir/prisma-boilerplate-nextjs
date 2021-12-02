import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from 'lib-server/prisma';
import { compare } from 'bcryptjs';
import nc, { ncOptions } from 'lib-server/nc';
import ApiError from 'lib-server/error';
import { userLoginSchema } from 'lib-server/validation';

const handler = nc(ncOptions);

handler.use(
  (req: NextApiRequest, res: NextApiResponse): NextApiHandler =>
    NextAuth(req, res, {
      providers: [
        FacebookProvider({
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
          name: 'Credentials',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          // redirect to same page and parse query params, unable to return api res
          async authorize(credentials) {
            const { user, error } = await getUser(credentials);
            if (error) throw error;
            return user;
          },
        }),
      ],
      session: {
        jwt: true, // doesnt work without this...
        maxAge: 60 * 60, // 1h
      },
      callbacks: {
        // both jwt and session are used to attach user to session
        async jwt({ token, user }) {
          user && (token.user = user);
          return token;
        },
        async session({ session, token }) {
          const _session = token.user ? { ...session, user: token.user } : undefined;
          return _session as Session;
        },
      },
      events: {
        // in createUser event user.accounts is empty []
        // set username and provider here
        // runs only on oauth
        // credentials default for non-linked
        async linkAccount({ user, account }) {
          const data = {
            provider: account.provider,
            username: `${account.provider}_user_${user.username}`,
          } as any;

          if (!user.email) {
            data.email = `${data.username}@non-existing-facebook-email.com`;
          }

          await prisma.user.update({
            where: { id: user.id },
            data,
          });
        },
      },
      jwt: { secret: process.env.SECRET },
      pages: { signIn: '/auth/login' },
      adapter: PrismaAdapter(prisma),
      debug: false,
    })
);

// for rest api? https://next-auth.js.org/getting-started/rest-api
async function getUser({ email, password }) {
  const result = userLoginSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      user: null,
      error: new ApiError(`Validation error: ${(result as any).error[0].message}.`, 401),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      user: null,
      error: new ApiError(`User with email: ${email} does not exist.`, 404),
    };
  }

  const isValid = password && user.password && (await compare(password, user.password));

  if (!isValid) {
    return {
      user,
      error: new ApiError('Invalid password.', 401),
    };
  }

  return { user, error: null };
}

export default handler;
