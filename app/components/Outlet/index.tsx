import React from 'react';
import { cloneElement } from 'react';
import useOutlet from 'hooks/useOutlet';

const wrapWithArray = (item) => (Array.isArray(item) ? item : [item]);

const Outlet = ({ id, ...props }) => {
  const outlet = useOutlet(id);

  if (!outlet) {
    return null;
  }

  return (
    <>
      {wrapWithArray(outlet).map((element, index) =>
        cloneElement(element, {
          key: `${id}_${index}`,
          ...element.props,
          ...props,
        })
      )}
    </>
  );
};

export default Outlet;
