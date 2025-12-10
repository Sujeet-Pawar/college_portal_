import React from 'react';

const badgeVariants = {
  default: 'badge-default',
  secondary: 'badge-secondary',
  destructive: 'badge-destructive',
  outline: 'badge-outline',
};

export function Badge({ className = '', variant = 'default', ...props }) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${badgeVariants[variant] || badgeVariants.default} ${className}`}
      {...props}
    />
  );
}

