import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from '@clerk/nextjs/server';
import { fetchUser } from "@/lib/actions/user.actions";
import ProfileHeader from "@/components/ProfileHeader";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import BlogsTab from "@/components/BlogsTab";
const page = async ({ params }) => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(params.id);

  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id.toString()}
        authUserId={user.id}
        username={userInfo.name}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />

      <div className="mt-9">
        <Tabs defaultValue="blogs" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>
                {tab.label === "Blogs" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-2 !text-tiny-medium text-light-2">
                    {userInfo?.blogs?.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {profileTabs.map((tab) => (
            <TabsContent key={`content-${tab.label}`} value={tab.value} className="w-full text-light-1">
                <BlogsTab currentUserId={user.id.toString()} accountId={userInfo.id.  toString()} accountType="User" />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default page;
