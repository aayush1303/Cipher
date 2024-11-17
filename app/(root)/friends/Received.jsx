"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { doc, onSnapshot, getDoc, setDoc, arrayUnion, updateDoc,arrayRemove } from 'firebase/firestore'
import { Check, User, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { db } from '@/api/firebaseConfig'
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import {toast} from 'sonner'


const Received = ({ email }) => {
  const [userData, setUserData] = useState(null); // To store user details
  const { user } = useUser();

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

  const acceptFriendRequest = async (email) => {
    const docId = user?.primaryEmailAddress?.emailAddress;
    const friendDocId = email;

    try {

      const userDocRef = doc(db, 'Users', docId);
      const friendDocRef = doc(db, 'Users', friendDocId);
      const requestsRef = doc(db, 'FriendRequests', `${friendDocId}_${docId}`);
      const conversationId = uuidv4();

      const userDocSnap = await getDoc(userDocRef);
      const friendDocSnap = await getDoc(friendDocRef);

      await updateDoc(userDocRef, {
        friends: arrayUnion(friendDocId),
      });
      await updateDoc(friendDocRef, {
        friends: arrayUnion(docId),
      });

      await updateDoc(userDocRef, {
        conversationIds: arrayUnion(conversationId),
      });
      await updateDoc(friendDocRef, {
        conversationIds: arrayUnion(conversationId),
      });

      await updateDoc(userDocRef, {
        friendRequestsReceived: arrayRemove(friendDocId),
      });
      await updateDoc(friendDocRef, {
        friendRequestsSent: arrayRemove(docId),
      });

      await updateDoc(requestsRef, {
        status: 'accepted',
      });

      await setDoc(doc(db, 'Conversations', conversationId), {
        user1: docId,
        avatar1: userDocSnap.data().avatar,
        user2: friendDocId,
        avatar2: friendDocSnap.data().avatar,
        user1Name: userDocSnap.data().name,
        user2Name: friendDocSnap.data().name,
        messages: [],
      });

      toast('Friend request accepted successfully');

    } catch (error) {
      toast('Error accepting friend request: ', error);

    }
  }

  const rejectFriendRequest = async (email) => {
    const docId = user?.primaryEmailAddress?.emailAddress;
    const friendDocId = email;

    try {

      const userDocRef = doc(db, 'Users', docId);
      const friendDocRef = doc(db, 'Users', friendDocId);
      const requestsRef = doc(db, 'FriendRequests', `${friendDocId}_${docId}`);

      const userDocSnap = await getDoc(userDocRef);
      const friendDocSnap = await getDoc(friendDocRef);

      await updateDoc(userDocRef, {
        friendRequestsReceived: arrayRemove(friendDocId),
      });
      await updateDoc(friendDocRef, {
        friendRequestsSent: arrayRemove(docId),
      });

      await updateDoc(requestsRef, {
        status: 'rejected',
      });

      console.log('Friend request rejected successfully');

    } catch (error) {
      console.error('Error accepting friend request: ', error);

    }
  }

  useEffect(() => {
    if (email) {
      getDetails(email);
    }
  }, [email]);

  return (
    <Card className="w-full p-2 flex flex-row gap-2 justify-between">
      <div className='flex items-center gap-4 truncate'>
        <Avatar>
          {userData?.avatar ? (
            <AvatarImage src={userData.avatar} alt={userData.name || 'User avatar'} />
          ) : (
            <AvatarFallback><User /></AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col truncate">
          <h4 className="truncate">{userData?.name}</h4>
          <p className='text-xs text-muted-foreground truncate'>{email}</p>
        </div>
      </div>
      <div className='flex gap-2 items-center'>
        <Button size="icon" onClick={() => acceptFriendRequest(email)}><Check /></Button>
        <Button size="icon" variant="destructive" onClick={()=>rejectFriendRequest(email)} ><X /></Button>
      </div>
    </Card>
  )
}

export default Received