"use client";
import ItemList from '@/components/shared/item-list/ItemList';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs'
import { db } from '@/api/firebaseConfig'
import { doc,onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import ConversationItem from './_components/GroupItem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';


const Layout = ({ children }) => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [groupData, setGroupData] = useState([]);

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const getDetails = () => {
    try {
      // Reference the current user's document
      const currentUserDocRef = doc(db, "Users", user?.primaryEmailAddress?.emailAddress);

      // Listen for real-time updates to the user's document
      const unsubscribeUser = onSnapshot(currentUserDocRef, (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);

          // Get group IDs from the user's groupIds array
          const groupIds = userData?.groupIds || [];

          if (groupIds.length > 0) {
            // Set up listeners for each group document
            const unsubscribeGroups = groupIds.map((groupId) => {
              const groupDocRef = doc(db, "Groups", groupId);

              return onSnapshot(groupDocRef, (groupDoc) => {
                if (groupDoc.exists()) {
                  const group = { id: groupDoc.id, ...groupDoc.data() };

                  // Update the groupData state with the latest group data
                  setGroupData((prevGroups) => {
                    // Avoid duplicate groups in the state
                    const updatedGroups = prevGroups ? [...prevGroups] : [];
                    const index = updatedGroups.findIndex((g) => g.id === group.id);

                    if (index > -1) {
                      updatedGroups[index] = group; // Update existing group
                    } else {
                      updatedGroups.push(group); // Add new group
                    }

                    return updatedGroups;
                  });
                }
              });
            });

            // Cleanup all group listeners when the user changes
            return () => unsubscribeGroups.forEach((unsubscribe) => unsubscribe());
          } else {
            console.log("No groups found for the user.");
            setGroupData([]); // Clear group data if no groups exist
          }
        } else {
          console.error("No user document found.");
        }
      });

      // Cleanup the user document listener when the component unmounts
      return () => unsubscribeUser();
    } catch (error) {
      console.error("Error fetching user or group details:", error);
    }
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      getDetails();
    }
  }, [user]);


  const handleImage = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );
      formData.append(
        "cloud_name",
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      );

      try {
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
          setUploadedImageUrl(data.secure_url); // Save uploaded image URL
          return data.secure_url;
        } else {
          console.error("Cloudinary upload failed:", data);
          alert("Failed to upload image.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image.");
      }
    } else {
      alert("No file selected!");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name); // Display file name
    }
  };

  const createGroup = async () => {
    const admin = user?.primaryEmailAddress?.emailAddress;
    const groupId = uuidv4();
    setIsSending(true);

    try {
      if (!groupName || !groupDescription) {
        alert("Group name and description are required.");
        return;
      }

      const currentUserDocRef = doc(db, "Users", admin);

      const uploadedImageUrl = await handleImage(); // Call your image upload function

      if (!uploadedImageUrl) {
        alert("Image upload failed. Please try again.");
        return;
      }

      // Create the new group
      await setDoc(doc(db, "Groups", groupId), {
        name: groupName,
        description: groupDescription,
        groupId: groupId,
        avatar: uploadedImageUrl,
        members: [admin],
        admins: [admin],
        createdAt: new Date().toISOString(),
        messages: [],
      });

      await updateDoc(currentUserDocRef, {
        groupIds: arrayUnion(groupId),
      });

      setGroupName("");
      setGroupDescription("");
      setFileName("");
      toast("Group created successfully!");
      setIsSending(false);
    } catch (error) {
      toast("Error creating or updating group: ", error);
    }
  };

  return (
    <>
      <ItemList title="Groups" action={
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon"><UserPlus /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Make a new group</DialogTitle>
                <DialogDescription>
                  Add you friends to a new group
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-left">
                    Group Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="New group"
                    className="col-span-3"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-left">
                    Group Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="A place for friends"
                    className="col-span-3"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avatar" className="text-left">
                    Group Icon
                  </Label>
                  <label>
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <Button asChild variant="outline">
                      <span>Select File</span>
                    </Button>
                  </label>
                  {fileName && (
                    <p className="text-sm col-span-4 text-muted-foreground">
                      Selected file: {fileName}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" disabled={isSending} onClick={() => createGroup()}>{isSending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "ADD"
                )}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }>
        {groupData.map((group) => (
          <ConversationItem key={group.id} group={group} />
        ))}
      </ItemList>
      {children}
    </>
  );
};

export default Layout;
