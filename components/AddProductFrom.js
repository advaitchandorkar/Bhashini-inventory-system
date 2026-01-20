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

const formSchema = z.object({
    productName: z.string(),
    price: z.coerce.number().gt(-1),
    quantity: z.coerce.number().gt(-1),
})
const AddProductFrom = () => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter();
    // console.log(user);
    // 1. Define your form.
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: "",
            price: 0,
            quantity: 0,

        },
    });

    // 2. Define a submit handler.
    const onSubmit = async (userData) => {
        setIsLoading(true)
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(userData);
        setIsLoading(false)

    }
    return (
        <section className="auth-form">
            <header className='flex flex-col gap-5 md:gap-8'>
               

                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                        Add Product

                    </h1>
                </div>
            </header>


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">


                    <CustomInput control={form.control} name='productName' label="ProductName" placeholder='Enter your productName' />

                    <CustomInput control={form.control} name='price' label="Price" placeholder='Enter your Price' />
                    <CustomInput control={form.control} name='quantity' label="Quantity" placeholder='Enter your Quantity' />

                    <div className="flex flex-col gap-4">
                        <Button type="submit" disabled={isLoading} className="form-btn">
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" /> &nbsp;
                                    Loading...
                                </>
                            ) : "Add Product"}
                        </Button>
                    </div>
                </form>
            </Form>


                            


        </section>
    )
}

export default AddProductFrom