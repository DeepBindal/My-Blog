"use server";

import { FilterQuery } from "mongoose";
import Community from "../models/community.model";
import Blog from "../models/blog.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

export const createCommunity = async (
  id,
  name,
  username,
  image,
  bio,
  createdById
) => {
  try {
    connectToDB();


    const user = await User.findOne({ id: createdById });

    if (!user) {
      throw new Error("User not found");
    }

    const newCommunity = new Community({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id,
    });

    const createdCommunity = await newCommunity.save();

    user.communities.push(createdCommunity._id);
    await user.save();
    console.log("community is ", createCommunity);
    return createdCommunity;
  } catch (error) {
    console.error("Error creating community:", error);
    throw error;
  }
};

export const fetchCommunityDetails = async (id) => {
  try {
    connectToDB();

    const communityDetails = await Community.findOne({ id }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return communityDetails;
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
};

export const fetchCommunityPosts = async (id) => {
  try {
    connectToDB();

    const communityPosts = await Community.findById(id).populate({
      path: "blogs",
      model: Blog,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id",
        },
        {
          path: "children",
          model: Blog,
          populate: {
            path: "author",
            model: User,
            select: "image _id",
          },
        },
      ],
    });

    return communityPosts;
  } catch (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }
};

export const fetchCommunities = async ({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
} = {}) => {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query = {};

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
};

export const addMemberToCommunity = async (communityId, memberId) => {
  try {
    connectToDB();

    const community = await Community.findOne({ id: communityId });

    if (!community) {
      throw new Error("Community not found");
    }

    const user = await User.findOne({ id: memberId });

    if (!user) {
      throw new Error("User not found");
    }

    if (community.members.includes(user._id)) {
      throw new Error("User is already a member of the community");
    }

    community.members.push(user._id);
    await community.save();

    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error) {
    console.error("Error adding member to community:", error);
    throw error;
  }
};

export const removeUserFromCommunity = async (userId, communityId) => {
  try {
    connectToDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    if (!userIdObject) {
      throw new Error("User not found");
    }

    if (!communityIdObject) {
      throw new Error("Community not found");
    }

    await Community.updateOne(
      { _id: communityIdObject._id },
      { $pull: { members: userIdObject._id } }
    );

    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: communityIdObject._id } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error removing user from community:", error);
    throw error;
  }
};

export const updateCommunityInfo = async (
  communityId,
  name,
  username,
  image
) => {
  try {
    connectToDB();

    const updatedCommunity = await Community.findOneAndUpdate(
      { id: communityId },
      { name, username, image }
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    console.error("Error updating community information:", error);
    throw error;
  }
};

export const deleteCommunity = async (communityId) => {
  try {
    connectToDB();

    const deletedCommunity = await Community.findOneAndDelete({
      id: communityId,
    });

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    await Blog.deleteMany({ community: communityId });

    const communityUsers = await User.find({ communities: communityId });

    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
};
