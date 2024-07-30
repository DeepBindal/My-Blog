import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDateString } from "@/lib/utils";

function BlogCard({
  id,
  currUserId,
  parentId,
  title,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment
}) {
  return (
    <article className={`flex w-full flex-col rounded-2xl ${isComment ? 'px-0 xs:px-7' : 'bg-dark-2 p-7'} shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt="profile image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>
            <div className="blog-card_bar bg-gray-300 w-0.5 h-16 mt-2" />
          </div>
          <div className="flex flex-col">
            <Link href={`/blog/${id}`}>
              <h4 className="text-xl font-bold text-white hover:underline">
                {title}
              </h4>
            </Link>
            <Link href={`/profile/${author.id}`} className="mt-1">
              <h5 className="cursor-pointer text-base font-semibold text-light-1 hover:underline">
                By: {author.name}
              </h5>
            </Link>
            <p className="mt-2 text-sm text-light-2">{content}</p>
            <div className={`${isComment ? 'mb-10' : ''} mt-5 flex flex-col gap-3`}>
              <div className="flex gap-3">
                <Image src="/assets/heart-gray.svg" alt="heart" width={24} height={24} className="cursor-pointer object-contain" />
                <Link href={`/blog/${id}`}>
                  <Image src="/assets/reply.svg" alt="reply" width={24} height={24} className="cursor-pointer object-contain" />
                </Link>
                <Image src="/assets/share.svg" alt="share" width={24} height={24} className="cursor-pointer object-contain" />
                <Image src="/assets/repost.svg" alt="repost" width={24} height={24} className="cursor-pointer object-contain" />
              </div>
              {comments?.length > 0 && (
                <Link href={`/blog/${id}`}>
                  <p className="mt-1 text-sm text-gray-400">
                    {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isComment && community && (
        <Link href={`/communities/${community.id}`} className="mt-5 flex items-center">
          <p className="text-sm text-gray-400">
            {formatDateString(createdAt)}{" "}
            {community && ` - ${community.name} Community`}
          </p>
          <Image
            src={community.image}
            alt={community.name}
            width={14}
            height={14}
            className="ml-1 rounded-full object-cover"
          />
        </Link>
      )}
    </article>
  );
}

export default BlogCard;
