import React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';

export const ToastProvider = ToastPrimitives.Provider;

export const ToastViewport = React.forwardRef(({ className = '', ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={`fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] ${className}`}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

export const Toast = React.forwardRef(({ className = '', variant = 'default', ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
        variant === 'destructive'
          ? 'destructive group border-destructive bg-destructive text-destructive-foreground'
          : 'border bg-background text-foreground'
      } ${className}`}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

export const ToastAction = React.forwardRef(({ className = '', ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

export const ToastClose = React.forwardRef(({ className = '', ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={`absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 ${className}`}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export const ToastTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={`text-sm font-semibold ${className}`}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

export const ToastDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={`text-sm opacity-90 ${className}`}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

