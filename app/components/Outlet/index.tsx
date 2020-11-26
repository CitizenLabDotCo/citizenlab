import React from 'react';
import useOutlet from 'hooks/useOutlet';
import { OutletId } from 'utils/moduleUtils';

interface OutletProps {
  id: OutletId;
  [key: string]: any;
}

const Outlet = ({ id, ...props }: OutletProps) => {
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
