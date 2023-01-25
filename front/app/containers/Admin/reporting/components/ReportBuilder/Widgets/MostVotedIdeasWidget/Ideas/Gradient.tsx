import React from 'react';

export default () => (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgb(0,0,0)" stopOpacity="0%" />
        <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="100%" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad1)" />
  </svg>
);
