import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Key, Selection } from 'react-aria-components';

// Items with a disabled reason stay enabled for React Aria so they keep focus and
// hover (for the tooltip). Their collection collects their keys here and drops any
// selection or action on them.
export const ReasonKeysContext = createContext<Set<Key> | null>(null);

// Each collection (Menu, ListBox, RadioGroup) keeps its own keys.
export const useReasonKeys = () => useRef(new Set<Key>()).current;

export const useRegisterReasonKey = (
  key: Key | undefined,
  hasReason: boolean
) => {
  const keys = useContext(ReasonKeysContext);

  useLayoutEffect(() => {
    if (!keys || key === undefined || !hasReason) return undefined;
    keys.add(key);
    return () => {
      keys.delete(key);
    };
  }, [keys, key, hasReason]);
};

// Keeps the value controlled, so a change the guard rejects never reaches React Aria.
export const useGuardedValue = <V>(
  value: V | undefined,
  defaultValue: V,
  onChange: ((value: V) => void) | undefined,
  isRejected: (next: V, current: V) => boolean
) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolledValue;

  const handleChange = (next: V) => {
    if (isRejected(next, current)) return;
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  return [current, handleChange] as const;
};

export const togglesReasonKey = (
  keys: Set<Key>,
  next: Selection,
  current: Selection
) => {
  if (next === 'all' || current === 'all') return false;
  return [...keys].some((key) => next.has(key) !== current.has(key));
};
