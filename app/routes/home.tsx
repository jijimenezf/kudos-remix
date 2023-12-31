import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { Layout } from "~/components/layout";
import { UserPanel } from "~/components/user-panel";
import { Kudo } from "~/components/kudo";
import { SearchBar } from "~/components/search-bar";
import { RecentBar } from "~/components/recent-bar";
import { getOtherUsers, getUserById } from "~/utils/users.server";
import { requireUserId } from "~/utils/auth.server";
import { getFilteredKudos, getRecentKudos } from "~/utils/kudos.server";
import type { KudoWithProfile } from "~/utils/types.server";
import type { Prisma } from "@prisma/client";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const users = await getOtherUsers(userId);
  const currentUser = await getUserById(userId)

  const url = new URL(request.url);
  const sort = url.searchParams.get('sort');
  const filter = url.searchParams.get('filter');

  let sortOptions: Prisma.KudoOrderByWithRelationInput = {};
  if (sort) {
    if (sort === 'date') {
      sortOptions = { createdAt: 'desc' }
    }
    if (sort === 'sender') {
      sortOptions = { author: { profile: { firstName: 'asc' } } }
    }
    if (sort === 'emoji') {
      sortOptions = { style: { emoji: 'asc' } }
    }
  }

  let textFilter: Prisma.KudoWhereInput = {};
  if (filter) {
    textFilter = {
      OR: [
        { message: {mode: 'insensitive', contains: filter } },
        { author: {
          OR: [
            { profile: { is: { firstName: { mode: 'insensitive', contains: filter } } } },
            { profile: { is: { lastName: { mode: 'insensitive', contains: filter } } } }
          ]
        }}
      ]
    }
  }

  const kudos = await getFilteredKudos(userId, sortOptions, textFilter);
  const recentKudos = await getRecentKudos();
  return json({ users, kudos, recentKudos, currentUser });
  // return json({ user: currentLoggedInUser }, { status: 200 });
}

export default function Home() {
  const { users, kudos, recentKudos, currentUser } = useLoaderData();
  //useLoaderData<typeof loader>();
  return (
    <Layout>
      <Outlet />
      <div className="h-full flex">
        <UserPanel users={users} />
        <div className="flex-1 flex flex-col">
          <SearchBar profile={currentUser.profile} />
          <div className="flex-1 flex">
            <div className="w-full p-10 flex flex-col gap-y-4">
              {kudos.map((kudo: KudoWithProfile) => (
                <Kudo key={kudo.id} kudo={kudo} profile={kudo.author.profile} />
              ))}
            </div>
            <RecentBar kudos={recentKudos} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
