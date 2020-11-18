import React from 'react';
import useOutlet from 'hooks/useOutlet';

const Outlet = ({ id, ...props }) => {
  const components = useOutlet(id);
  if (!components) return null;

  return (
    <>
      {components.map((Component, index) => (
        <Component key={`${id}_${index}`} {...props} />
      ))}
    </>
  );
};

export default Outlet;
