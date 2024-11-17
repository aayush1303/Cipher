"use client";
import ConversationFallback from '@/components/shared/conversation/ConversationFallback';
import ItemList from '@/components/shared/item-list/ItemList';
import React, { useEffect, useState } from 'react';
import AddFriend from './_components/AddFriend';
import Request from './Request';
import { useUser } from '@clerk/nextjs';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/api/firebaseConfig';
import Received from './Received';

const FriendsPage = () => {
  const { user } = useUser();
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);
  const [friendRequestsReceived, setFriendRequestsReceived] = useState([]);

  const fetchFriendRequestsSent = (userEmail) => {
    const userDocRef = doc(db, 'Users', userEmail);

    // Set up real-time listener using onSnapshot
    return onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const requestsSent = userData?.friendRequestsSent || [];
        setFriendRequestsSent(requestsSent);
        console.log('Real-time friend requests sent by user:', requestsSent);
      } else {
        console.log('No user document found');
      }
    });
  };

  const fetchFriendRequestsReceived = (userEmail) => {
    const userDocRef = doc(db, 'Users', userEmail);

    // Set up real-time listener using onSnapshot
    return onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const requestsReceived = userData?.friendRequestsReceived || [];
        setFriendRequestsReceived(requestsReceived);
        console.log('Real-time friend requests received by user:', requestsReceived);
      } else {
        console.log('No user document found');
      }
    });
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      // Call fetchFriendRequestsSent with the user's email and set up the listener
      const unsubscribeSent = fetchFriendRequestsSent(user.primaryEmailAddress.emailAddress);

      // Cleanup the listener when component unmounts
      return () => unsubscribeSent();
    }
  }, [user]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      // Call fetchFriendRequestsReceived with the user's email and set up the listener
      const unsubscribeReceived = fetchFriendRequestsReceived(user.primaryEmailAddress.emailAddress);

      // Cleanup the listener when component unmounts
      return () => unsubscribeReceived();
    }
  }, [user]);


  return (
    <>
      <ItemList title="Friends" action={<AddFriend />}>
        <div className="requests-container gap-4 flex flex-col w-full">
          {friendRequestsSent?.length === 0 && friendRequestsReceived?.length === 0 ? (
            <p className="no-requests-message">No friend requests sent / received</p>
          ) : (
            <>
              {/* Sent Friend Requests */}
              {friendRequestsSent?.length > 0 && (
                <div className="requests-section">
                  {friendRequestsSent.map((email) => (
                    <Request key={email} email={email} />
                  ))}
                </div>
              )}

              {/* Received Friend Requests */}
              {friendRequestsReceived?.length > 0 && (
                <div className="requests-section">
                  {friendRequestsReceived.map((email) => (
                    <Received key={email} email={email} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ItemList>
      <ConversationFallback />
    </>
  )
}

export default FriendsPage