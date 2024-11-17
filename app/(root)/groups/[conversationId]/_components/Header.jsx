"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { CircleArrowLeft, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { db } from '@/api/firebaseConfig';
import { doc, getDoc,arrayUnion,updateDoc } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';



const Header = ({ params }) => {
  const { user } = useUser();
  const [groupData, setGroupData] = useState(null);
  const [showIcon, setShowIcon] = useState(false);
  const[friendEmail,setFriendEmail]=useState('');
  const [isSending, setIsSending] = useState(false);

  const getDetails = async () => {
    const groupId = params?.conversationId;
    const groupDocRef = doc(db, 'Groups', groupId);

    try {
      const docSnap = await getDoc(groupDocRef);
      if (docSnap.exists()) {
        const groupData = docSnap.data();
        setGroupData(groupData);

        // Check if the current user is an admin
        const isAdmin = groupData?.admins.includes(user?.primaryEmailAddress?.emailAddress);
        setShowIcon(isAdmin); // Update state
      } else {
        console.log('No such conversation!');
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  const addUser = async () => {
    const groupId = params?.conversationId;
    setIsSending(true);
    try {
      const groupDocRef = doc(db, 'Groups', groupId);
      const friendDocRef = doc(db, 'Users', friendEmail);
      await updateDoc(groupDocRef, {
        members: arrayUnion(friendEmail),
      });
      await updateDoc(friendDocRef, {
        groupIds: arrayUnion(groupId),
      });
      toast('User added to group successfully!');
      setIsSending(false);
    } catch (error) {
      toast('Error adding user to group:', error);
    }
  }

  useEffect(() => {
    if (user) {
      getDetails();
    }
  }, [params, user]);

  return (
    <Card className="w-full flex rounded-lg items-center p-2 justify-between">
      <div className="flex items-center gap-2">
        <Link className="block lg:hidden" href={'/groups'}>
          <CircleArrowLeft />
        </Link>
        <Avatar className="w-10 h-10 overflow-hidden rounded-full">
          {groupData?.avatar ? (
            <AvatarImage
              src={groupData?.avatar}
              alt={groupData?.name || 'Group avatar'}
              className="object-cover w-full h-full"
            />
          ) : (
            <AvatarFallback>
              <User />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col items-start">
          <h2>{groupData?.name || 'Unknown User'}</h2>
          <p className="text-muted-foreground text-sm">
            {groupData?.description || 'Unknown description'}
          </p>
        </div>
      </div>
      {showIcon && (
        <Button variant="outline" size="icon">
                    <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon"><UserPlus /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Your Friend</DialogTitle>
                <DialogDescription>
                  Add you friends to the group
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col justify-center items-start gap-2">
                  <Label htmlFor="name" className="text-left">
                    Friend's Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="Friend's Email"
                    className="col-span-3"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
              <Button type="button" disabled={isSending} onClick={() => addUser()}>
                {isSending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "ADD"
                )}
                </Button>              
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Button>
      )}
    </Card>
  );
};

export default Header;