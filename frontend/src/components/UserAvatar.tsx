import { memo } from 'react';

interface UserAvatarProps {
  name: string | null;
  email: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function UserAvatarComponent({ name, email, size = 'md', className = '' }: UserAvatarProps) {
  // Get initials from name or email
  const getInitials = (): string => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(' ');
      // For full names like "John Doe", show "JD"
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      // For single names like "John", show "JO" (first 2 chars)
      return name.substring(0, 2).toUpperCase();
    }

    if (email && email.length > 0) {
      return email.substring(0, 2).toUpperCase();
    }

    return 'U';
  };

  // Get background color based on name/email (consistent for same user)
  const getBackgroundColor = (): string => {
    const str = name || email || 'user';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      'bg-primary-500',
      'bg-accent-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${getBackgroundColor()} ${className} rounded-full flex items-center justify-center text-white font-semibold shadow-md`}
      title={name || email || 'User'}
    >
      {getInitials()}
    </div>
  );
}

export const UserAvatar = memo(UserAvatarComponent);
