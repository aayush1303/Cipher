"use client";
import React, { useState, useEffect } from 'react';
import Message from './Message';
import { db } from '@/api/firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';

const Body = ({ params }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const docId = user?.primaryEmailAddress?.emailAddress;

  const getMessages = () => {
    const conversationId = params?.conversationId;

    try {
      const conversationDocRef = doc(db, 'Conversations', conversationId);

      // Real-time listener
      const unsubscribe = onSnapshot(conversationDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const conversationData = docSnap.data();
          const updatedMessages = conversationData.messages || [];

          // Update unseen messages to seen
          const unseenMessages = updatedMessages.filter(
            (message) => !message.seen && message.sender !== docId
          );

          if (unseenMessages.length > 0) {
            const updatedMessagesWithSeen = updatedMessages.map((message) =>
              unseenMessages.includes(message)
                ? { ...message, seen: true }
                : message
            );

            // Update Firestore with new seen status
            updateDoc(conversationDocRef, {
              messages: updatedMessagesWithSeen,
            });
          }

          setMessages(updatedMessages);
        } else {
          console.log('No conversation data found');
        }
      });

      // Cleanup listener
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching messages: ', error);
    }
  };

  useEffect(() => {
    const unsubscribe = getMessages();
    return () => unsubscribe();
  }, [params, user]);

  return (
    <div className="flex-1 w-full h-full max-h-screen overflow-y-auto flex flex-col-reverse gap-2 p-3 no-scrollbar">
      {messages.slice().reverse().map((message, index) => {
        const isSender = message.sender === docId;
        return (
          <Message
            key={index}
            isSender={isSender}
            messageText={message.content}
            time={message.timestamp}
            senderAvatar={message.senderAvatar}
            receiverAvatar={message.receiverAvatar}
            imageUrl={message.imageUrl}
            seen={message.seen}
          />
        );
      })}
    </div>
  );
};

export default Body;
