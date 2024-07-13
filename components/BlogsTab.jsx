import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/dist/server/api-utils";
import React from "react";
import BlogCard from "./BlogCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

async function BlogsTab({ currentUserId, accountId, accountType }) {
  let result;
  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) redirect("/");
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result?.blogs?.map((blog) => (
        <BlogCard
          key={blog._id}
          id={blog._id}
          currentUserId={currentUserId}
          parentId={blog.parentId}
          content={blog.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: blog.author.name,
                  image: blog.author.image,
                  id: blog.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { name: result.name, id: result.id, image: result.image }
              : blog.community
          }
          createdAt={blog.createdAt}
          comments={blog.children}
        />
      ))}
    </section>
  );
}

export default BlogsTab;
