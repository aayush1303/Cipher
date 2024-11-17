"use client";
import React, { useEffect, useState } from 'react';
import { set, z } from 'zod';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog } from '@radix-ui/react-dialog';
import { Tooltip } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { db } from '@/api/firebaseConfig';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner"
import { setDoc, doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';

const addFriendFormSchema = z.object({
    email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' })
});

const AddFriend = () => {
    const [userData, setUserData] = useState(null);
    const[isSending, setIsSending] = useState(false);
    const form = useForm({
        resolver: zodResolver(addFriendFormSchema),
        defaultValues: {
            email: '',
        },
    });

    const { user } = useUser();

    useEffect(() => {
        const docId = user?.primaryEmailAddress?.emailAddress;
        if (!docId) return;

        const userDocRef = doc(db, 'Users', docId);

        // Set up real-time listener for user data
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            }
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, [user]);

    const sendFriendRequest = async (email) => {
        const docId = user?.primaryEmailAddress?.emailAddress;
        const friendDocId = email;
        setIsSending(true);
        try {
            const userDocRef = doc(db, 'Users', docId);
            const friendDocRef = doc(db, 'Users', friendDocId);

            const userDocSnap = await getDoc(userDocRef);
            const friendDocSnap = await getDoc(friendDocRef);


            if (!userDocSnap.exists() || !friendDocSnap.exists()) {
                console.error('User or friend does not exist.');
                return;
            }

            const userData = userDocSnap.data();
            const friendData = friendDocSnap.data();
    
            // Check if a friend request was already sent or received
            if (userData.friendRequestsSent?.includes(friendDocId)) {
                console.log('Friend request already sent to this user.');
                return;
            }

            if (userData.friendRequestsReceived?.includes(friendDocId)) {
                console.log('Friend request already received from the user.');
                return;
            }

            if(userData.friends?.includes(friendDocId)) {
                console.log('This user is already your friend.');
                return;
            }
    
            if (friendData.friendRequestsReceived?.includes(docId)) {
                console.log('This user has already received a friend request from you.');
                return;
            }

            if (friendData.friendRequestsSent?.includes(docId)) {
                console.log('This user has already sent you a friend request.');
                return;
            }

            if(friendData.friends?.includes(docId)) {
                console.log('This user is already your friend.');
                return;
            }

            // Update friend requests in Firestore
            await updateDoc(userDocRef, {
                friendRequestsSent: arrayUnion(friendDocId),
            });
            await updateDoc(friendDocRef, {
                friendRequestsReceived: arrayUnion(docId),
            });

            await setDoc(doc(db, 'FriendRequests', `${docId}_${friendDocId}`), {
                sender: docId,
                receiver: friendDocId,
                status: 'pending', // Track request state
            });

            toast("Friend request sent successfully.");
            setIsSending(false);
        } catch (error) {
            toast("Error sending friend request:", error);
        }
    };

    const handleSubmit = async (data) => {
        console.log("Submitting friend request for:", data.email);
        await sendFriendRequest(data.email);
        form.reset(); // Reset the form after submission
    };

    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger>
                    <Button size="icon" variant="outline">
                        <DialogTrigger>
                            <UserPlus />
                        </DialogTrigger>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Add a new friend</TooltipContent> {/* Add TooltipContent to display the tooltip */}
            </Tooltip>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                    <DialogDescription>
                        Send a request to connect with a friend
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button disabled={isSending} type="submit">{isSending ? <Loader2 className='animate-spin'/> : "Send"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddFriend;
