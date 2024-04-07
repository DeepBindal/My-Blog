import * as z from "zod";

export const BlogValidation = z.object({
  blog: z
    .string().nonempty()
    .min(3, { message: "Minimum 3 characters." }),
    accountId: z.string(),
});

export const CommentValidation = z.object({
    blog : z.string().min(3, { message: "Minimum 3 characters." }),
})