import React from "react";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import PostBlog from "@/components/PostBlog";

async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <>
      <h1 className="head-text">Create Blog</h1>
      <PostBlog userId={(userInfo._id)} />
    </>
  );
}

export default Page;
