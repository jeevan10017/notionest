import { z } from 'zod';

export const signupInput = z.object({   
    username : z.string().email(),
    password : z.string().min(6),
    name : z.string().optional()
});


// type interface for signupInput
export type SignupInput = z.infer<typeof signupInput>;


export const signinInput = z.object({
    username : z.string().email(),
    password : z.string().min(6)
});

// type interface for signinInput
export type SigninInput = z.infer<typeof signinInput>;

export const createBlogInput = z.object({
    title : z.string(),
    content : z.string(),
});

// type interface for createBlogInput
export type CreateBlogInput = z.infer<typeof createBlogInput>;

export const updateBlogInput = z.object({
    title : z.string(),
    content : z.string(),
    id : z.number()
});


// type interface for updateBlogInput
export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
