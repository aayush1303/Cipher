"use client";
import React, { useEffect } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { Card } from '@/components/ui/card';
import { UserButton, useAuth, useUser } from '@clerk/nextjs';
import { db } from '@/api/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TooltipContent } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ui/theme/theme-toggle';

const DesktopNav = () => {
    const { user } = useUser();
    const paths = useNavigation();

    useEffect(() => {
        if (user) saveUserData();
    }, [user]);

    const saveUserData = async () => {
        const docId = user?.primaryEmailAddress?.emailAddress;
        const userDocRef = doc(db, 'Users', docId);

        try {
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                    name: user?.fullName,
                    avatar: user?.imageUrl,
                    email: user?.primaryEmailAddress?.emailAddress,
                    friends: [],
                    friendRequestsReceived: [],
                    friendRequestsSent: [],
                    conversationIds: [],
                    groupIds: [],
                });
                console.log("User data saved.");
            } else {
                console.log("User document already exists.");
                console.log("user Name", user?.fullName);
            }
        } catch (error) {
            console.error('Error saving user data: ', error);
        }
    };


  return (
    <Card className = "hidden lg:flex lg:flex-col lg:justify-between lg:items-center lg:h-full lg:w-16 lg:px-2 lg:py-4 ">
        <nav>
            <ul className='flex flex-col items-center gap-4 '>
                {paths.map((path,id)=>{
                    return (
                        <li key={id} className='relative'>
                            <Link href={path.href}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button size ="icon"
                                        variant={path.active ? 'default' : 'outline'}
                                        >{path.icon}</Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{path.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
        <div className='flex flex-col items-center gap-4'><ThemeToggle/> <UserButton/></div>
    </Card>
  )
}

export default DesktopNav