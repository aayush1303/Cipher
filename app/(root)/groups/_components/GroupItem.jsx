"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { User, UserPlus } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import Link from 'next/link';

const ConversationItem = ({ group }) => {
  return (
    <>
      <Link href={`/groups/${group?.id}`} className="w-full">
        <Card className="flex p-2 flex-row items-center gap-4 truncate">
          <div className="flex flex-row items-center gap-4 truncate">
            <Avatar className="w-10 h-10 overflow-hidden rounded-full">
              {group?.avatar ? (
                <AvatarImage
                  src={group?.avatar}
                  alt={group?.name || "Group avatar"}
                  className="object-cover w-full h-full"
                />
              ) : (
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col truncate">
              <h4 className="truncate">{group?.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{group?.description}</p>
            </div>
          </div>
        </Card>
      </Link>
    </>

  );
}

export default ConversationItem;
