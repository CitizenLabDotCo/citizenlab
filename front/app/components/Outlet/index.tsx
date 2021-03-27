import React, { memo, useContext } from 'react';
import { OutletsPropertyMap, OutletId } from 'utils/moduleUtils';
import { OutletsContext } from 'containers/OutletsProvider';
import { isEmpty } from 'lodash-es';

type CustomPropsMap = {
  [P in keyof OutletsPropertyMap]: { id: P } & OutletsPropertyMap[P];
};

type CustomOutletProps = CustomPropsMap[keyof CustomPropsMap];
export type OutletRenderProps = (
  renderProps: JSX.Element | JSX.Element[]
) => JSX.Element | null;
type Children = OutletRenderProps;
type InputProps = {
  children?: Children;
};

function useOutlet(identifier: OutletId) {
  const outlets = useContext(OutletsContext);
  return outlets[identifier];
}

type Props = InputProps & CustomOutletProps;

const Outlet = memo(({ children, id, ...props }: Props) => {
  const outletComponents = useOutlet(id);

  if (outletComponents && !isEmpty(outletComponents)) {
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
