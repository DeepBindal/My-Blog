"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import Blog from "../models/blog.model";
export async function updateUser({ userId, username, name, image, bio, path }) {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userID) {
  try {
    connectToDB();
    const user = await User.findOne({ id: userID });
    // .populate({path: 'communities', model: "Community"});

    if (!user) return null;

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchUserPosts(userId) {
  try {
    connectToDB();

    const blogs = User.findOne({ id: userId }).populate({
      path: "blogs",
      model: Blog,
      populate: {
        path: "children",
        model: Blog,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });

    return blogs;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}) {
  try {
    connectToDB();

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getActivity(userId) {
  try {
    connectToDB();

    // Find all threads created by the user
    const userBlogs = await Blog.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childBlogIds = userBlogs.reduce((acc, userBlog) => {
      return acc.concat(userBlog.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Blog.find({
      _id: { $in: childBlogIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
    console.error("Error fetching replies: ", error);
    throw error;
  }
}