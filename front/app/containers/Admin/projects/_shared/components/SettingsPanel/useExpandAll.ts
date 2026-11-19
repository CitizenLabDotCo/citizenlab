import { useMemo, useState } from 'react';

const useExpandAll = () => {
  const [count, setCount] = useState(0);

  return useMemo(
    () => ({ count, expand: () => setCount((value) => value + 1) }),
    [count]
  );
};

export default useExpandAll;
