import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCheck, User } from 'lucide-react';

const Message = ({ isSender, messageText, time, senderAvatar, receiverAvatar, imageUrl, seen }) => {
  return (
    <div className={`flex items-start space-x-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
        {isSender ? (
          senderAvatar ? (
            <AvatarImage src={senderAvatar} alt="Sender Avatar" />
          ) : (
            <AvatarFallback><User /></AvatarFallback>
          )
        ) : (
          receiverAvatar ? (
            <AvatarImage src={senderAvatar} alt="Receiver Avatar" />
          ) : (
            <AvatarFallback><User /></AvatarFallback>
          )
        )}
      </Avatar>

      {/* Message Content */}
      <div className={`p-4 rounded-lg ${isSender ? 'bg-gray-100 text-gray-900 dark:bg-gray-800' : 'bg-gray-100 text-gray-900 dark:bg-gray-800'} w-[40%] md:w-[30%] lg:w-[30%]`}>
        {imageUrl && (
          <div className="mb-2">
            <a href={imageUrl} download>
              <img
                src={imageUrl}
                alt="Message Attachment"
                className="rounded-lg max-h-40 w-full object-cover"
              />
            </a>
          </div>
        )}
        <div className="text-sm dark:text-[#fff]">{messageText}</div>
        <span className="text-xs text-gray-500 mt-1 flex flex-row justify-between items-center">
          {time}
          <span className="text-gray-500 ml-2 flex items-center">
            <CheckCheck className={`h-4 w-4 ${seen ? 'text-blue-500' : ''}`} />
          </span>
        </span>
      </div>
    </div>
  );
};

export default Message;
