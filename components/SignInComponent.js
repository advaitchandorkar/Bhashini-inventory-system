'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import CustomInput from './CustomInput';

const formSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    
})


const SignInComponent = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter();
    // console.log(user);
    // 1. Define your form.
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // 2. Define a submit handler.
  // Inside your onSubmit function in AuthForm.js

  const onSubmit = async (userData) => {
    setIsLoading(true);

    try {
         {
            const result = await api.post('/api/auth/login', userData);
            localStorage.setItem('token', result.token);
            router.push('/');
        }
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
};

 const type = 'sign-in'



  return (
    <section className="auth-form">
            <header className='flex flex-col gap-5 md:gap-8'>
                <Link href="/" className="cursor-pointer flex items-center gap-1">
                    <Image
                        src="/icons/l2.jpeg"
                        width={36}
                        height={36}
                        alt="Avatar"
                        className="overflow-hidden rounded-full"
                    />
                    <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Eagle Eye</h1>
                </Link>

                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                        Sign In

                    </h1>
                </div>
            </header>

            <>
            <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter Your password" {...field} type='password'/>
              </FormControl>
              
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-4">

        <Button type="submit" disabled={isLoading} className="form-btn">
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> &nbsp;
                                        Loading...
                                    </>
                                ) : 'Sign In'}
                            </Button>
        </div>
      </form>
    </Form>

    <footer className="flex justify-center gap-1">
                    <p className="text-14 font-normal text-gray-600">
                        {type === 'sign-in'
                            ? "Don't have an account?"
                            : "Already have an account?"}
                    </p>
                    <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="form-link">
                        {type === 'sign-in' ? 'Sign up' : 'Sign in'}
                    </Link>
                </footer>
            </>
            </section>
  )
}

export default SignInComponent
