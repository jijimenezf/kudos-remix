import { type MetaFunction, type LoaderFunction, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Kudos App" },
    { name: "description", content: "Welcome to Kudos!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return redirect('/home');
}
