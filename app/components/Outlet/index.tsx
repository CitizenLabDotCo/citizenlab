import React from 'react';
import useOutlet from 'hooks/useOutlet';
import { OutletsPropertyMap } from 'utils/moduleUtils';

type CustomPropsMap = {
  [P in keyof OutletsPropertyMap]: { id: P } & OutletsPropertyMap[P];
};

type Props = CustomPropsMap[keyof CustomPropsMap];

const Outlet = ({ id, ...props }: Props) => {
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
