"use client";
import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { SendHorizontal, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming ShadCN button component is in this path
import { Input } from '@/components/ui/input'; // Assuming ShadCN input component is in this path
import { db } from '@/api/firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { set } from 'zod';


const ChatInput = ({ params }) => {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [receiverAvatar, setReceiverAvatar] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);


  // Fetch avatar URLs from the conversation document
  useEffect(() => {
    const fetchAvatars = async () => {
      const conversationId = params?.conversationId;
      if (!conversationId) return;

      try {
        const conversationDocRef = doc(db, 'Conversations', conversationId);
        const conversationSnapshot = await getDoc(conversationDocRef);

        if (conversationSnapshot.exists()) {
          const { avatar1, avatar2 } = conversationSnapshot.data();

          // Determine receiverAvatar based on user's avatar URL
          if (user?.imageUrl) {
            setReceiverAvatar(user.imageUrl === avatar1 ? avatar2 : avatar1);
          }
        }
      } catch (error) {
        console.error('Error fetching avatars:', error);
      }
    };

    fetchAvatars();
  }, [params, user]);

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      handleSend(); 
    }
  };


  const handleImage = async () => {
    let imageUrl = null;

    if (file) {
      // Prepare the form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

      try {
        // Upload the image to Cloudinary
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (response.ok) {
          console.log("Cloudinary upload successful:", data.secure_url);
          return data.secure_url;
        } else {
          console.error("Cloudinary upload failed:", data);
          alert("Failed to upload image.");
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image.");
        return;
      }
    }

    setMessage("");
    setFile(null);
    setFilePreview(null);
  };

  const handleVideo = async () => {
    let videoUrl = null;

    if (file) {
      // Prepare the form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

      try {
        // Upload the image to Cloudinary
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (response.ok) {
          console.log("Cloudinary upload successful:", data.secure_url);
          return data.secure_url;
        } else {
          console.error("Cloudinary upload failed:", data);
          alert("Failed to upload image.");
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image.");
        return;
      }
    }

    setMessage("");
    setFile(null);
    setFilePreview(null);
  };

  const handleSend = async () => {

    if (!message.trim() && !file) return;

    const docId = user?.primaryEmailAddress?.emailAddress;
    const conversationId = params?.conversationId;

    let mediaUrl = null;

    if (file) {
      const fileType = file.type;
  
      if (fileType.startsWith("image/")) {
        mediaUrl = await handleImage();
      } else if (fileType.startsWith("video/")) {
        mediaUrl = await handleVideo();
      } else {
        alert("Unsupported file type. Please upload an image or video.");
        return;
      }
  
      if (!mediaUrl) return;
    }
    
    setIsSending(true);

    try {
      const conversationDocRef = doc(db, 'Conversations', conversationId);
      const messageData = {
        content: message,
        sender: docId,
        timestamp: new Date().toLocaleString(),
        senderAvatar: user.imageUrl,
        receiverAvatar: receiverAvatar,
        imageUrl: mediaUrl,
        seen: false,
      };

      await updateDoc(conversationDocRef, {
        messages: arrayUnion(messageData),
      });

      setMessage(''); // Clear the input after sending
      setFile(null); // Clear the file after sending
      setFilePreview(null); // Clear the file preview after sending
      setIsSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };



  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile)); // Set preview URL for display
    }
  };


  return (
    <Card className="w-full p-2 rounded-lg relative flex items-end space-x-2">
      <div className="relative flex-grow">
        {filePreview && (
          <div className="mb-2">
            <img src={filePreview} alt="Selected" className="max-h-24 rounded-lg" />
          </div>
        )}
        <Input
          as="textarea"
          placeholder="Type your message or select an image..."
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full resize-none p-2 pl-2 pr-8 border-none focus-visible:ring-0 focus-visible:ring-transparent"
        />
        <label className="absolute inset-y-0 right-2 flex items-end mb-2 cursor-pointer">
          <Paperclip className="text-gray-400" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <Button onClick={handleSend}disabled={isSending}>
      {isSending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <SendHorizontal />
      )}
      </Button>
    </Card>
  );
};

export default ChatInput;