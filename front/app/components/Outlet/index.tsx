import React, { memo, useContext, Suspense } from 'react';

import { OutletsContext } from 'containers/OutletsProvider';

import { OutletsPropertyMap, OutletId } from 'utils/moduleUtils';

type CustomPropsMap = {
  [P in keyof OutletsPropertyMap]: { id: P } & OutletsPropertyMap[P];
};

type InputProps = {
  onRender?: (hasRendered: boolean) => void;
  children?: Children;
};

type CustomOutletProps = CustomPropsMap[keyof CustomPropsMap];

export type OutletRenderProps = (
  renderProps: JSX.Element[]
) => JSX.Element | null;

type Children = OutletRenderProps;

function useOutlet(identifier: OutletId) {
  const outlets = useContext(OutletsContext);
  return outlets[identifier] ?? [];
}

type Props = InputProps & CustomOutletProps;

const Outlet = memo(({ children, id, ...props }: Props) => {
  const outletComponents = useOutlet(id);

  const componentsToRender = outletComponents.map((Component, index) => (
    <Component key={`${id}_${index}`} {...props} />
  ));

  if (children) {
    return <Suspense fallback={null}>{children(componentsToRender)}</Suspense>;
  }

  return <Suspense fallback={null}>{componentsToRender}</Suspense>;
});

export default Outlet;
