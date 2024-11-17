"use client";
import ItemList from '@/components/shared/item-list/ItemList';
import React,{useState,useEffect} from 'react';
import ConversationItem from './_components/ConversationItem';
import { useUser } from '@clerk/nextjs'
import { db } from '@/api/firebaseConfig'
import { doc, getDoc,onSnapshot } from 'firebase/firestore'

const Layout = ({ children }) => {

  const { user } = useUser();
  const [friends, setFriends] = useState([]); 

  const getFriends = (userEmail) => {
    const userDocRef = doc(db, 'Users', userEmail);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const friendsList = userData?.friends || []; // Extract the 'friends' field
        setFriends(friendsList); // Update the state with the friends list
        console.log('Real-time friends:', friendsList);
      } else {
        console.log('No such user!');
      }
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      // Call getFriends and set up the listener
      const unsubscribe = getFriends(user.primaryEmailAddress.emailAddress);

      // Cleanup the listener when component unmounts
      return () => unsubscribe();
    }
  }, [user]);

  return <>
  <ItemList title="Conversations">
  {friends.map((friendEmail, index) => (
        <ConversationItem key={index} friendEmail={friendEmail} />
  ))}
  </ItemList>
  {children}
  </>;
};

export default Layout;
