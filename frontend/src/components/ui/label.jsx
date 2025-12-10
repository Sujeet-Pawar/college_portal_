import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import './label.css';

export const Label = React.forwardRef(({ className = '', ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={`label ${className}`}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

