"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Blog from "../models/blog.model";
import Community from "../models/community.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level Blogs) (a Blog that is not a comment/reply).
  const postsQuery = Blog.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (Blogs) i.e., Blogs that are not comments.
  const totalPostsCount = await Blog.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function createBlog({ text, author, communityId, path }) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdBlog = await Blog.create({
      text,
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { blogs: createdBlog._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { blogs: createdBlog._id },
      });
    }

    revalidatePath(path);
  } catch (error) {
    throw new Error(`Failed to create Blog: ${error.message}`);
  }
}

async function fetchAllChildBlogs(BlogId) {
  const childBlogs = await Blog.find({ parentId: BlogId });

  const descendantBlogs = [];
  for (const childBlog of childBlogs) {
    const descendants = await fetchAllChildBlogs(childBlog._id);
    descendantBlogs.push(childBlog, ...descendants);
  }

  return descendantBlogs;
}

export async function deleteBlog(id, path) {
  try {
    connectToDB();

    // Find the Blog to be deleted (the main Blog)
    const mainBlog = await Blog.findById(id).populate("author community");

    if (!mainBlog) {
      throw new Error("Blog not found");
    }

    // Fetch all child Blogs and their descendants recursively
    const descendantBlogs = await fetchAllChildBlogs(id);

    // Get all descendant Blog IDs including the main Blog ID and child Blog IDs
    const descendantBlogIds = [id, ...descendantBlogs.map((Blog) => Blog._id)];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantBlogs.map((Blog) => Blog.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainBlog.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantBlogs.map((Blog) => Blog.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainBlog.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child Blogs and their descendants
    await Blog.deleteMany({ _id: { $in: descendantBlogIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { Blogs: { $in: descendantBlogIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { Blogs: { $in: descendantBlogIds } } }
    );

    revalidatePath(path);
  } catch (error) {
    throw new Error(`Failed to delete Blog: ${error.message}`);
  }
}

export async function fetchBlogById(BlogId) {
  connectToDB();

  try {
    const Blog = await Blog.findById(BlogId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Blog, // The model of the nested children (assuming it's the same "Blog" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return Blog;
  } catch (err) {
    console.error("Error while fetching Blog:", err);
    throw new Error("Unable to fetch Blog");
  }
}

export async function addCommentToBlog(BlogId, commentText, userId, path) {
  connectToDB();

  try {
    // Find the original Blog by its ID
    const originalBlog = await Blog.findById(BlogId);

    if (!originalBlog) {
      throw new Error("Blog not found");
    }

    // Create the new comment Blog
    const commentBlog = new Blog({
      text: commentText,
      author: userId,
      parentId: BlogId, // Set the parentId to the original Blog's ID
    });

    // Save the comment Blog to the database
    const savedCommentBlog = await commentBlog.save();

    // Add the comment Blog's ID to the original Blog's children array
    originalBlog.children.push(savedCommentBlog._id);

    // Save the updated original Blog to the database
    await originalBlog.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
