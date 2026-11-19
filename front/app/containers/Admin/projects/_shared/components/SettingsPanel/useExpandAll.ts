import { useMemo, useState } from 'react';

// The value for an ExpandAllContext provider around a panel's setting cards.
const useExpandAll = () => {
  const [count, setCount] = useState(0);

  return useMemo(
    () => ({ count, expand: () => setCount((value) => value + 1) }),
    [count]
  );
};

export default useExpandAll;
