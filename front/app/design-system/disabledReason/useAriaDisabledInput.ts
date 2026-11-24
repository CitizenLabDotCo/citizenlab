import { RefObject, useEffect } from 'react';

// React Aria gives no way to set aria-disabled on the hidden input of a Switch or Radio,
// and the input has to stay enabled to keep focus, so the attribute is set on the DOM.
const useAriaDisabledInput = (
  inputRef: RefObject<HTMLInputElement | null>,
  isAriaDisabled: boolean
) => {
  useEffect(() => {
    const input = inputRef.current;
    if (!input || !isAriaDisabled) return undefined;
    input.setAttribute('aria-disabled', 'true');
    return () => input.removeAttribute('aria-disabled');
  }, [inputRef, isAriaDisabled]);
};

export default useAriaDisabledInput;
