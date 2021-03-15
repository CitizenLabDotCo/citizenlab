import React from 'react';
import { isEmpty } from 'lodash-es';
import useOutlet from 'hooks/useOutlet';
import { OutletsPropertyMap } from 'utils/moduleUtils';
import { isUndefinedOrError } from 'utils/helperUtils';

type BaseProps = {
  fallback?: JSX.Element;
};

type CustomPropsMap = {
  [P in keyof OutletsPropertyMap]: { id: P } & OutletsPropertyMap[P];
};

type Props = CustomPropsMap[keyof CustomPropsMap];

const Outlet = ({ id, fallback, ...props }: Props & BaseProps) => {
  const components = useOutlet(id);

  if (!components || isEmpty(components)) {
    if (isUndefinedOrError(fallback)) {
      return null;
    }

    return fallback;
  }

  return (
    <>
      {components.map((Component, index) => (
        <Component key={`${id}_${index}`} {...props} />
      ))}
    </>
  );
};

export default Outlet;
