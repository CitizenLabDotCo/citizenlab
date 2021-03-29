import { OutletsContext } from 'containers/OutletsProvider';
import { useContext } from 'react';
import { OutletId } from 'utils/moduleUtils';

const useOutlet = (identifier: OutletId) => {
  const outlets = useContext(OutletsContext);
  return outlets[identifier];
};

export default useOutlet;
