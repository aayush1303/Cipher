"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { CircleArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { db } from '@/api/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';

const Header = ({ params }) => {
  const { user } = useUser();
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserAvatar, setOtherUserAvatar] = useState("");

  const getDetails = async (user) => {
    const docId = user?.primaryEmailAddress?.emailAddress;
    const conversationId = params?.conversationId;
    const conversationDocRef = doc(db, 'Conversations', conversationId);

    try {
      const docSnap = await getDoc(conversationDocRef);
      if (docSnap.exists()) {
        const conversationData = docSnap.data();

        // Determine the other user's name and avatar based on the current user
        if (conversationData.user1 === docId) {
          setOtherUserName(conversationData.user2Name);
          setOtherUserAvatar(conversationData.avatar2); // Use user2's avatar if current user is user1
        } else if (conversationData.user2 === docId) {
          setOtherUserName(conversationData.user1Name);
          setOtherUserAvatar(conversationData.avatar1); // Use user1's avatar if current user is user2
        }
      } else {
        console.log('No such conversation!');
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  useEffect(() => {
    if (user) {
      getDetails(user);
    }
  }, [params, user]);

  return (
    <Card className="w-full flex rounded-lg items-center p-2 justify-between">
      <div className="flex items-center gap-2">
        <Link className="block lg:hidden" href={'/conversations'}>
          <CircleArrowLeft />
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherUserAvatar} />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <h2>{otherUserName || "Unknown User"}</h2>
      </div>
    </Card>
  );
};

export default Header;
