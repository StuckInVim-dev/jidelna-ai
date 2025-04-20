import { prisma } from '@/lib/prisma'
import Link from 'next/link';

export default async function Users() {

    const users = await prisma.user.findMany();

    return (
        <div className='grid'>
            {users.map((user) => {
                return (
                    <div className='p-8' key={user.id}>
                        <Link href={`/profile/${user.id}`}>{user.email}</Link>
                    </div>
                )
            })}
        </div>
    )
}