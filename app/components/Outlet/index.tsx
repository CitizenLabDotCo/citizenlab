import React, { memo, useContext } from 'react';
import { OutletsPropertyMap, OutletId } from 'utils/moduleUtils';
import { OutletsContext } from 'containers/OutletsProvider';

type CustomPropsMap = {
  [P in keyof OutletsPropertyMap]: { id: P } & OutletsPropertyMap[P];
};

type CustomOutletProps = CustomPropsMap[keyof CustomPropsMap];
type children = (
  renderProps: JSX.Element | JSX.Element[]
) => JSX.Element | null;
type InputProps = {
  children?: children;
};

function useOutlet(identifier: OutletId) {
  const outlets = useContext(OutletsContext);
  return outlets[identifier];
}

type Props = InputProps & CustomOutletProps;

const Outlet = memo(({ children, id, ...props }: Props) => {
  const outletComponents = useOutlet(id);

  if (outletComponents) {
    const componentsToRender = outletComponents.map((Component, index) => (
      <Component key={`${id}_${index}`} {...props} />
    ));

    if (children) {
      return children(componentsToRender);
    } else {
      return <>{componentsToRender}</>;
    }
  }

  return null;
});

export default Outlet;
