// app/routes/avatar.tsx
import { ActionFunction, json } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";

export const action: ActionFunction = async ({ request }) => {
  // 1
  const userId = await requireUserId(request);
  // 2
  //const imageUrl = await uploadAvatar(request);
  const imageUrl = "https://picsum.photos/seed/picsum/200/300"

  // 3
  /* await prisma.user.update({
    data: {
      profile: {
        update: {
          profilePicture: imageUrl,
        },
      },
    },
    where: {
      id: userId,
    },
  }); */

  // 4
  return json({ imageUrl });
};