import React from 'react';
import useOutlet from 'hooks/useOutlet';

const Outlet = ({ id, ...props }) => {
  const outlets = useOutlet(id);
  return outlets.map((Outlet, index) => (
    <Outlet key={`${id}_${index}`} {...props} />
  ));
};

export default Outlet;
