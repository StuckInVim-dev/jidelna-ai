import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

interface Props {
    params: {
        id: string;
    }
}


export default async function IdProfile({ params }: Props) {
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    const { name, email, image } = user ?? {};
    return (

        <h1 className="font-medium text-slate-900 text-3xl m-[20px]">{name}'s profile</h1>
    )

}