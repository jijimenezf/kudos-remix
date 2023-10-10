import { prisma } from "./prisma.server";
import type { KudoStyle, Prisma } from "@prisma/client";

type KudoInput = {
    message: string;
    userId: string;
    recipientId: string;
    style: KudoStyle;
}

export const createKudo = async ({message, userId, recipientId, style}: KudoInput) => {
    await prisma.kudo.create({
        data: {
            message,
            style,
            author: {
                connect: {
                    id: userId,
                },
            },
            recipient: {
                connect: {
                    id: recipientId,
                },
            }
        }
    });
}

export const getFilteredKudos = async (
    userId: string,
    sortFilter: Prisma.KudoOrderByWithRelationInput,
    whereFilter: Prisma.KudoWhereInput,
) => {
    return await prisma.kudo.findMany({
        select: {
            id: true,
            style: true,
            message: true,
            author: {
                select: {
                    profile: true,
                }
            },
        },
        orderBy: {
            ...sortFilter,
        },
        where: {
            recipientId: userId,
            ...whereFilter,
        }
    });
}

export const getRecentKudos = async () => {
    return await prisma.kudo.findMany({
        take: 3,
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            style: {
                select: {
                    emoji: true,
                },
            },
            recipient: {
                select: {
                    id: true,
                    profile: true,
                },
            },
        }
    });
}
