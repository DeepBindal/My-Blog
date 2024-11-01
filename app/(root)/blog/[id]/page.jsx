import { redirect } from "next/navigation";
import { currentUser } from '@clerk/nextjs/server';

import Comment from "@/components/Comment";
import BlogCard from "@/components/BlogCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchBlogById } from "@/lib/actions/blog.actions";

export const revalidate = 0;

async function page({ params }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const blog = await fetchBlogById(params.id);

  return (
    <section className='relative'>
      <h1 className="head-text mb-4">{blog.title}</h1>
      <div>
        <BlogCard
          id={blog._id}
          currentUserId={user.id}
          parentId={blog.parentId}
          content={blog.text}
          author={blog.author}
          community={blog.community}
          createdAt={blog.createdAt}
          comments={blog.children}
        />
      </div>

      <div className='mt-7'>
        <Comment
          blogId={params.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className='mt-10'>
        {blog.children.map((childItem) => (
          <BlogCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment={true}
          />
        ))}
      </div>
    </section>
  );
}

export default page;