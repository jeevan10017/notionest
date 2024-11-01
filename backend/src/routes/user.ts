import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {sign } from 'hono/jwt'
import {signupInput, signinInput} from "@jeevan10017/notionnest-common"

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();



userRouter.post('/signup', async(c) => {
    const body = await c.req.json();
    const success = signupInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.text("Invalid input")
    }
    const prisma = new PrismaClient({
          datasourceUrl: c.env.DATABASE_URL	,
      }).$extends(withAccelerate()); 
  
  //zod hashed the password
  try{
    const user = await prisma.user.create({
    data: {
      username: body.username,
      password  : body.password,
      name  : body.name,
    }
  
    })
    const jwt = await sign ({
      id : user.id,
    }, c.env.JWT_SECRET)
   return c.json({
      message: "User created",
      jwt
    })
  }catch(e){
    console.log(e)
    c.status(411);
    return c.text("Username already exists")
  }
  })
  
  
userRouter.post('/signin', async(c) => {
    const body = await c.req.json();
    const success = signinInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.text("Invalid input")
    }
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  try{
  const user = await prisma.user.findFirst({
    where: {
      username: body.username,
      password: body.password,
    }
  })
  
  if(!user){
    c.status(403);
    return c.json({
      message: "Invalid credentials" 
    })
  }
  const jwt = await sign({
    id: user.id,
  }, c.env.JWT_SECRET)
  return c.json({
    message: "Login successful",
    jwt
  })
  }catch(e){
    console.log(e)
    c.status(411);
    return c.text("Internal server error")
  }
  })
  
  
  
  