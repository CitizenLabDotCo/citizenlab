import { useCallback } from 'react';
import { MessageDescriptor } from 'react-intl';
import { Multiloc } from 'typings';

const useConvertMessagesToMultiloc = () => {
  const convertMessageToMultiloc = useCallback(
    (message: MessageDescriptor): Multiloc => {
      return {};
    },
    []
  );

  return convertMessageToMultiloc;
};

export default useConvertMessagesToMultiloc;
