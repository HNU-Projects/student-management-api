'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.description]:text-muted-foreground",
          actionButton:
            "group-[.actionButton]:bg-primary group-[.actionButton]:text-primary-foreground",
          cancelButton:
            "group-[.cancelButton]:bg-muted group-[.cancelButton]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
