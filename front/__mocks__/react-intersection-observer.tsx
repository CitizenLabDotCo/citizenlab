import React, { useEffect } from 'react';

export default ({ children, onChange }) => {
  useEffect(() => {
    onChange({ isIntersecting: true }, () => {})
  }, [])

  return <>{children}</>
};
