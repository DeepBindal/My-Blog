import { fetchUserPosts } from '@/lib/actions/user.actions'
import { redirect } from 'next/dist/server/api-utils';
import React from 'react'
import BlogCard from './BlogCard';

async function BlogsTab({currentUserId, accountId, accountType}) {
    const result = await fetchUserPosts(accountId);

    if(!result) redirect("/")
  return (
    <section className='mt-9 flex flex-col gap-10'>
        {result.blogs.map((blog) => (
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
            community={blog.community}
            createdAt={blog.createdAt}
            comments={blog.children}
          />
        ))}
    </section>
  )
}

export default BlogsTab