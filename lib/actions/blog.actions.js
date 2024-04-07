"use server";
import Blog from "../models/blog.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

export async function createBlog({ text, author, communityId, path }) {
  try {
    connectToDB();
    const createdBlog = await Blog.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, { $push: { blogs: createdBlog._id } });

    revalidatePath(path);
  } catch (error) {
    console.log(error.message);
  }
}

export async function fetchPosts(pagenumber = 1, pageSize = 20) {
  connectToDB();

  const skipAmount = (pagenumber - 1) * pageSize;
  const postsQuery = Blog.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    // .populate({
    //   path: "community",
    //   model: Community,
    // })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  const totalPostsCount = await Blog.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchBlogById(blogId) {
  connectToDB();

  try {
    const blog = await Blog.findById(blogId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      // .populate({
      //   path: "community",
      //   model: Community,
      //   select: "_id id name image",
      // }) // Populate the community field with _id and name
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
            model: Blog, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return blog;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToBlog(blogId, commentText, userId, path) {
  connectToDB();
  try {
    const originalBlog = await Blog.findById(blogId);
    if (!originalBlog) {
      throw new Error("Blog not found");
    }

    const commentBlog = new Blog({
      text: commentText,
      author: userId,
      parentId: blogId, // Set the parentId to the original thread's ID
    });

    const savedCommentBlog = await commentBlog.save();

    originalBlog.children.push(savedCommentBlog._id);

    await originalBlog.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}
