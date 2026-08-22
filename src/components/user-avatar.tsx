'use client';

import { UserRound } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface UserAvatarProps {
  avatarUrl?: string | null;
  avatarAlt?: string;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  iconClassName?: string;
}

export default function UserAvatar({
  avatarUrl,
  avatarAlt = 'User avatar',
  size = 'default',
  className,
  iconClassName,
}: UserAvatarProps) {
  return (
    <Avatar
      className={className}
      size={size}>
      {avatarUrl ? (
        <AvatarImage
          src={avatarUrl}
          alt={avatarAlt}
        />
      ) : null}
      <AvatarFallback>
        <UserRound className={iconClassName} />
      </AvatarFallback>
    </Avatar>
  );
}
