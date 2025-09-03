import { useState, useEffect } from 'react';

function useDebugState<T>(
  initialValue: T,
  stateName: string
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);

  useEffect(() => {
    // uncomment the one(s) you need
    // console.log(`${stateName} initial value:`, initialValue);
    // console.log(`${stateName} updated to:`, state);
  }, [state, stateName, initialValue]); // Logs whenever 'state' or 'stateName' changes

  return [state, setState];
}

export default useDebugState;
