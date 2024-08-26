import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

const linkButtonStyles = cn(
  'h-[40px] inline-flex items-center justify-center whitespace-nowrap rounded-md text-xsm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 px-6 py-4 rounded-none text-white bg-white border border-black shadow-[5px_5px_0px_-2px_#000000] active:shadow-[0_0_#666] active:translate-y-1',
  'bg-white text-primary-foreground hover:bg-slate-100 text-black text-xsm',
);

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
  scroll?: boolean;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  children,
  className,
  onClick,
  scroll = false,
  ...props
}) => {
  return (
    <Link
      href={href}
      scroll={scroll}
      className={cn(linkButtonStyles, className)}
      {...props}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default LinkButton;
