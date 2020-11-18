import { OutletsContext } from 'containers/OutletsProvider';
import { useContext } from 'react';

const useOutlet = (identifier) => {
  const outlets = useContext(OutletsContext);
  return outlets[identifier];
};

export default useOutlet;
