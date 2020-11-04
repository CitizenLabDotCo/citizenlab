import { OutletsContext } from 'containers/OutletsProvider';
import { cloneElement, useContext } from 'react';

const wrapWithArray = (item) => (Array.isArray(item) ? item : [item]);

const useOutlet = (identifier, props = {}) => {
  const outlets = useContext(OutletsContext);
  console.log(outlets);

  const found = outlets[identifier];

  if (!found) {
    return null;
  }

  if (!props) {
    return found;
  }

  return (propsToInject = {}) =>
    wrapWithArray(found).map((plugin) =>
      cloneElement(plugin, { ...plugin.props, ...propsToInject, ...props })
    );
};

export default useOutlet;
