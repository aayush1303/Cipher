"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { User, UserPlus } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { doc, getDoc,getDocs,setDoc,query,where,collection,arrayUnion,updateDoc } from 'firebase/firestore';
import { db } from '@/api/firebaseConfig';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { set } from 'zod';

const ConversationItem = ({ friendEmail }) => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null); 

  const getDetails = async (friendEmail) => {
    const userDocRef = doc(db, 'Users', friendEmail);
    const currentUserDocRef = doc(db, 'Users', user?.primaryEmailAddress?.emailAddress);

    try {
      const docSnap = await getDoc(userDocRef);
      const currentUserDocSnap = await getDoc(currentUserDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentUserData = currentUserDocSnap.data();
        setUserData(userData);
        setCurrentUser(currentUserData);

        const friendConversationIds = userData?.conversationIds;
        const currentUserConversationIds = currentUserData?.conversationIds;

        const conversationId = friendConversationIds.find(id =>
          currentUserConversationIds.includes(id)
        );

        if (conversationId) {
          console.log('Common conversation ID found:', conversationId);
          setConversationId(conversationId); // Set the conversationId state
        } else {
          console.log('No common conversation ID found.');
          setConversationId(null); // No conversation found
        }

      } else {
        console.log('No such user!');
      }
    } catch (error) {
      console.error('Error fetching user details: ', error);
    }
  };

  useEffect(() => {
    if (friendEmail) {
      getDetails(friendEmail);
    }
  }, [friendEmail]);

  return (
    conversationId ? (
      <div className='w-full relative flex flex-row justify-end items-center'>
        <Link href={`/conversations/${conversationId}`} className='w-full'>
          <Card className="flex p-2 flex-row items-center gap-4 truncate">
            <div className='flex flex-row items-center gap-4 truncate'>
              <Avatar>
                {userData?.avatar ? (
                  <AvatarImage src={userData.avatar} alt={userData.name || 'User avatar'} />
                ) : (
                  <AvatarFallback><User /></AvatarFallback>
                )}
              </Avatar>
              <div className='flex flex-col truncate'>
                <h4 className='truncate'>{userData?.name}</h4>
                <p className='text-sm text-muted-foreground truncate'>Start Conversation</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    ) : null
  );
}

export default ConversationItem;
