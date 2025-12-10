import React from 'react';
import './form.css';

export const Textarea = React.forwardRef(({ className = '', rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={`form-textarea ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
