"use client";
import React, { useEffect, useState, use } from 'react';
import ConversationContainer from '@/components/shared/conversation/ConversationContainer';
import { Loader2 } from 'lucide-react';
import Header from './_components/Header';
import Body from './_components/body/Body';
import ChatInput from './_components/input/ChatInput';

const ConversationPage = ({ params: paramsPromise }) => {
  const params = use(paramsPromise); 
  const [id, setId] = useState(null);

  useEffect(() => {
    if (params?.conversationId) {
      setId(params.conversationId);
    }
  }, [params]);

  return (
    id ? (
      <ConversationContainer>
        <Header params={params}/>
        <Body params={params}/>
        <ChatInput params={params}/>
      </ConversationContainer>
    ) : (
      <div className='w-full h-full flex items-center justify-center'>
        <p>Conversation not found!</p>
      </div>  
    )
  );
};

export default ConversationPage;
