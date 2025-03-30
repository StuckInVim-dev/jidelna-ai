import Link from 'next/link'
import React from 'react'

export default function SIgnInButton() {
  return (
    <>
    <Link href={"/api/auth/signin"}>Sign in</Link>
    </>
  )
}
