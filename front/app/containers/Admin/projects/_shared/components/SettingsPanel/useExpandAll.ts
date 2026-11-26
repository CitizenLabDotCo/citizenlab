import { useMemo, useState } from 'react';

const useExpandAll = () => {
  const [state, setState] = useState({ count: 0, opened: false });

  return useMemo(
    () => ({
      ...state,
      toggle: () =>
        setState((previous) => ({
          count: previous.count + 1,
          opened: !previous.opened,
        })),
    }),
    [state]
  );
};

export default useExpandAll;
