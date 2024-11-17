"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { Check, User, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { db } from '@/api/firebaseConfig'

const Request = ({ email }) => {
    const [userData, setUserData] = useState(null); // To store user details

    const getDetails = async (email) => {
        const userDocRef = doc(db, 'Users', email);
        try {
            const docSnap = await getDoc(userDocRef); // Make sure to fetch the doc using getDoc
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setUserData(userData); // Set user details in state
                console.log('User data:', userData);
            } else {
                console.log('No such user!');
            }
        } catch (error) {
            console.error('Error fetching user details: ', error);
        }
    };

    useEffect(() => {
        if (email) {
            getDetails(email);
        }
    }, [email]);

    return (
        <Card className="w-full p-2 flex flex-row justify-between gap-2 backdrop-blur-lg bg-black/30">
            <div className='flex items-center gap-4 truncate'>
                <Avatar>
                    {userData?.avatar ? (
                        <AvatarImage src={userData.avatar} alt={userData.name || 'User avatar'} />
                    ) : (
                        <AvatarFallback><User /></AvatarFallback>
                    )}
                </Avatar>
                <div className="flex flex-col truncate w-full">
                    <h4 className="truncate">{userData?.name}</h4>
                    <p className='text-xs text-muted-foreground truncate'>{email}</p>
                </div>
            </div>
        </Card>
    )
}

export default Request