'use client';

import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Settings,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from '@/i18n/routing';

import { useAuthQueries } from '@/features/auth/hooks/useAuthQueries';
import { useAuthMutations } from '@/features/auth/hooks/useAuthMutations';

interface UserProfileDropdownProps {
  align?: 'start' | 'end' | 'center';
}

export function UserProfileDropdown({ align = 'end' }: UserProfileDropdownProps) {
  const t = useTranslations('UserMenu');
  const { getMeQuery } = useAuthQueries();
  const { logout } = useAuthMutations();
  
  const user = getMeQuery.data;

  if (!user) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center outline-none">
          <Avatar className="h-10 w-10 border-2 border-primary/10 hover:border-primary/30 transition-all">
            <AvatarImage src={''} alt={user.full_name} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {user.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mt-2 rounded-2xl p-2" align={align} sideOffset={8}>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild className="rounded-xl h-10 cursor-pointer">
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>{t('dashboard')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl h-10 cursor-pointer">
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <User className="mr-2 h-4 w-4" />
              <span>{t('profile')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl h-10 cursor-pointer">
            <Link href="/dashboard/settings" className="flex items-center gap-2">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('settings')}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={logout}
          className="rounded-xl h-10 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer m-1"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
