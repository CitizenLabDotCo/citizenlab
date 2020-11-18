import { OutletsContext } from 'containers/OutletsProvider';
import { useContext } from 'react';

const useOutlet = (identifier) => {
  const outlets = useContext(OutletsContext);
  if (!identifier) return [];
  return outlets[identifier] || [];
};

export default useOutlet;
