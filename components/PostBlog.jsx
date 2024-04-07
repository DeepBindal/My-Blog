"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Button } from "./ui/button";
import { useOrganization } from "@clerk/nextjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Textarea } from "./ui/textarea";
import { usePathname, useRouter } from "next/navigation";
import { BlogValidation } from "@/lib/validations/blog";
import { createBlog } from "@/lib/actions/blog.actions";
function PostBlog({ userId }) {
  const { organization } = useOrganization();
  console.log(organization);
  const pathname = usePathname();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(BlogValidation),
    defaultValues: {
      blog: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values) => {
    await createBlog({
      text: values.blog,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });
    router.push("/");
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-10 flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="blog"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full gap-4">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">
          Post Blog
        </Button>
      </form>
    </Form>
  );
}

export default PostBlog;
