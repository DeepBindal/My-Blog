import React from 'react'
import { currentUser } from '@clerk/nextjs/server';
import AccountProfile from '@/components/AccountProfile'
import { fetchUser } from '@/lib/actions/user.actions';
import { redirect } from "next/navigation";
async function page() {
  const user = await currentUser();
  if(!user) return null;

  const userInfo = await fetchUser(user.id);

  if (userInfo?.onboarded) redirect("/");

  const userData = {
    id : user?.id,
    objectId: userInfo?._id,
    username:userInfo ?  userInfo?.username : user?.username,
    name:userInfo ? userInfo?.name : user?.firstName || "",
    bio: userInfo ?  userInfo?.bio : "",
    image:userInfo ? userInfo?.image : user?.imageUrl
  }
  return (
    <main className='mx-auto flex flex-col max-w-3xl justify-start px-10 py-20'>
      <h1 className='head-text'>Onboarding</h1>
      <p className='mt-3 text-base-regular text-light-2'>Complete your profile now to continue ti MyBlog</p>

      <section className='mt-9 bg-dark-2 p-10'>
        <AccountProfile user={userData} btnTitle={"continue"}/>
      </section>
    </main>
  )
}

export default page