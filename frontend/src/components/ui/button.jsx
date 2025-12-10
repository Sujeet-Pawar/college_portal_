import React from 'react';
import { Loader2 } from 'lucide-react';
import './button.css';

export const Button = React.forwardRef(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantClass = `button-${variant}`;
    const sizeClass = size !== 'default' ? `button-${size}` : '';

    return (
      <button
        ref={ref}
        className={`button ${variantClass} ${sizeClass} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" style={{ marginRight: '0.5rem' }} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

