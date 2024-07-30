import { fetchPosts } from "@/lib/actions/blog.actions";
import { currentUser } from "@clerk/nextjs";
import BlogCard from "@/components/BlogCard";
export default async function Home() {
  const result = await fetchPosts(1, 30);
  const user = await currentUser();
  return (
    <>
      <h1 className="head-text text-center">Blog</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p>No Blogs found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <BlogCard
                key={post._id}
                id={post._id}
                currUserId={user?.id || ""}
                parentId={post.parentId}
                title={post.title}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
