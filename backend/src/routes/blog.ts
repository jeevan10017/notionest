import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'
import { createBlogInput,updateBlogInput } from '@jeevan10017/notionnest-common'

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
    Variables: {
        userId: string,
    }
}>();

//middleware
blogRouter.use("/*",async (c, next) => {
    const authHeader = c.req.header("Authorization") || "";
    const user = await verify(authHeader, c.env.JWT_SECRET);
    if(user){
        //ts-ignore
       c.set("userId", user.id as string);
        await next();
    }
    else{
        c.status(403);
        return c.json({
            message: "Unauthorized / you are not logged in"
        })
    }
});


blogRouter.post('/', async(c) => {
    const body = await c.req.json();
    const success = createBlogInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.text("Invalid input")
    }
    const authorId = c.get("userId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      content  : body.content,
      authorId : Number(authorId),
    }

  })
   return c.json({
        message: "Blog created",
        id : blog.id,
        })
  })


  blogRouter.put('/', async(c) => {
    const body = await c.req.json();
    const success = updateBlogInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.text("Invalid input")
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blog = await prisma.blog.update({
    where: {
        id : body.id,
    },
    data: {
      title: body.title,
      content  : body.content,
    }

  })
   return c.json({
        message: "Blog updated",
        id : blog.id,
        })
  })


  //pagination
  blogRouter.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blogs = await prisma.blog.findMany();
    return c.json({
        blogs
        })

  })
  
  blogRouter.get('/:id', async(c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
try{
  const blog = await prisma.blog.findFirst({
    where: {
        id : Number(id),
    }
  })
   return c.json({
        blog
        })
    }catch(e){
        c.status(411);
        return c.text("Blog not found")
    }
  })

