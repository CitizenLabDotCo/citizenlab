import React from 'react';

// Disabled reasons keep collection items focusable so their tooltip can open.
const renderAriaDisabled = (props: React.JSX.IntrinsicElements['div']) => (
  <div {...props} aria-disabled="true" />
);

export default renderAriaDisabled;
