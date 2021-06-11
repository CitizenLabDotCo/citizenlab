import { useRef } from 'react';

export default function useWillMount(func: () => void) {
  const ref = useRef(true);

  if (ref.current) {
    func();
    ref.current = false;
  }
}
