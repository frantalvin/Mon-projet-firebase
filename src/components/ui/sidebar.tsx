
import * as React from 'react';
import Link, { type LinkProps } from 'next/link';
import { cn } from '@/lib/utils';

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn('flex h-full flex-col', className)}
    {...props}
  />
));
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('border-b p-4', className)}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

const SidebarTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold tracking-tight', className)}
    {...props}
  >
    {children}
  </h2>
));
SidebarTitle.displayName = 'SidebarTitle';

const SidebarBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto p-4', className)}
    {...props}
  />
));
SidebarBody.displayName = 'SidebarBody';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('border-t p-4', className)}
    {...props}
  />
));
SidebarFooter.displayName = 'SidebarFooter';

const SidebarNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn('flex flex-col space-y-1', className)}
    {...props}
  />
));
SidebarNav.displayName = 'SidebarNav';

const SidebarNavMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col', className)}
    {...props}
  />
));
SidebarNavMain.displayName = 'SidebarNavMain';

const SidebarNavHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-3 py-2', className)}
    {...props}
  />
));
SidebarNavHeader.displayName = 'SidebarNavHeader';

const SidebarNavHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn('text-xs font-semibold uppercase text-muted-foreground', className)}
    {...props}
  >
    {children}
  </h4>
));
SidebarNavHeaderTitle.displayName = 'SidebarNavHeaderTitle';

interface SidebarNavLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

const SidebarNavLink = React.forwardRef<
  HTMLAnchorElement,
  SidebarNavLinkProps
>(({ href, children, className, active, ...props }, ref) => (
  <Link
    href={href}
    ref={ref}
    className={cn(
      'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
      active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
      className
    )}
    {...props}
  >
    {children}
  </Link>
));
SidebarNavLink.displayName = 'SidebarNavLink';

const SidebarSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn('my-2 border-border', className)}
    {...props}
  />
));
SidebarSeparator.displayName = 'SidebarSeparator';

export {
  Sidebar,
  SidebarHeader,
  SidebarTitle,
  SidebarBody,
  SidebarFooter,
  SidebarNav,
  SidebarNavMain,
  SidebarNavHeader,
  SidebarNavHeaderTitle,
  SidebarNavLink,
  SidebarSeparator,
};
