import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { fetchUser, fetchUsers, getActivity } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";
const page = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);
  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>

      <div className="m-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
            {activity.map((activity) => (
              <Link key={activity._id} href={`/blog/${activity.parentId}`}>
                <article className="activity-card">
                  <Image
                    src={activity.author.image}
                    alt="profile pictur"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <p className="!text-base-regular text-light-1">
                    <span className="mr-1 text-primary-500">{activity.author.name}</span> replied to your blog
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet</p>
        )}
      </div>
    </section>
  );
};

export default page;
