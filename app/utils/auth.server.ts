import { prisma } from "./prisma.server";
import { json, createCookieSessionStorage, redirect } from "@remix-run/node";
import { createUser } from "./users.server";
import bcrypt from 'bcryptjs';
import type { TSignUp, TLogin } from "./types.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is not set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "kudos-session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export const register = async (form: TSignUp) => {
  const exists = await prisma.user.count({
    where: { email: form.email }
  });

  if (exists) {
    return json(
      { error: 'User already exists with that email' },
      { status: 400 }
    );
  }

  const result = await createUser(form);

  if (!result) {
    return json(
      { error: 'Something went wrong to create a a new user',
        fields: { email: form.email, password: form.password },
      },
      { status: 400 }
    );
  }
  console.log("**** register", {result});

  return createUserSession(result.id, "/");
};

export const login = async (form: TLogin) => {
  const user = await prisma.user.findUnique({
    where: { email: form.email }
  });

  if (!user || !(await bcrypt.compare(form.password, user.password))) {
    return json(
      { error: 'Incorrect login' },
      { status: 400 }
    );
  }

  return createUserSession(user.id, "/");
};

export const createUserSession = async (userId: string, redirectTo: string) => {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    }
  });
};

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, profile: true}
    });
    return user;
  } catch (error) {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session)
    }
  })
}
