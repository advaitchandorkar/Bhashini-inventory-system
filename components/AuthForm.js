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
import { api } from '@/lib/api';

const formSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    shopName: z.string(),
    phone: z.coerce.number({
        required_error: "Phone is required",
        invalid_type_error: "Number should be of 10 digits",
    }).gt(9)
    ,
})
const AuthForm = ({ type }) => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [emailExisted, setEmailExisted] = useState("")
    const router = useRouter();
    // console.log(user);
    // 1. Define your form.
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            shopName: "",
            phone: 0,

        },
    });

    // 2. Define a submit handler.
    const onSubmit = async (userData) => {
        setIsLoading(true)
        setEmailExisted("")

        try {
            if (type === 'sign-up') {
                const result = await api.post('/api/auth/signup', userData);
                localStorage.setItem('token', result.token);
                router.push('/');
            }
            if (type === 'sign-in') {
                const result = await api.post('/api/auth/login', userData);
                localStorage.setItem('token', result.token);
                router.push('/');
            }
        }
        catch (error) {
            console.log(error);
            setEmailExisted(error.message || "Email already existed");
        } finally {
            setIsLoading(false)
        }

    }

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
                        {user

                            ? 'Link Account'
                            : type === 'sign-in'
                                ? 'Sign In'
                                : 'Sign Up'
                        }

                    </h1>
                </div>
            </header>

            <>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {type === 'sign-up' && (
                            <>
                                <div className="flex gap-4">
                                    <CustomInput control={form.control} name='name' label="Name" placeholder='Enter yourname' />
                                </div>
                                <CustomInput control={form.control} name='address' label="Address" placeholder='Enter your specific address' />
                                <CustomInput control={form.control} name='city' label="City" placeholder='Enter your city' />
                                <div className="flex gap-4">
                                    <CustomInput control={form.control} name='state' label="State" placeholder='Example: NY' />
                                    <CustomInput control={form.control} name='postalCode' label="Postal Code" placeholder='Example: 11101' />
                                </div>
                                <div className="flex gap-4">
                                    <CustomInput control={form.control} name='shopName' label="ShopName" placeholder='Enter your shopname' />
                                    <CustomInput control={form.control} name='phone' label="Phone" placeholder='Enter your phone' />
                                </div>
                            </>
                        )}

                        <CustomInput control={form.control} name='email' label="Email" placeholder='Enter your email' />
                            {
                                <div className="font-semibold text-2xl">
                                    {emailExisted}
                                </div>
                            }

                        <CustomInput control={form.control} name='password' label="Password" placeholder='Enter your password' />

                        <div className="flex flex-col gap-4">
                            <Button type="submit" disabled={isLoading} className="form-btn">
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> &nbsp;
                                        Loading...
                                    </>
                                ) : type === 'sign-in'
                                    ? 'Sign In' : 'Sign Up'}
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

export default AuthForm
