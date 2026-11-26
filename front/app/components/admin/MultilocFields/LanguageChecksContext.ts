import { createContext, useCallback, useMemo, useRef } from 'react';

type Check = () => boolean;

type LanguageChecks = {
  register: (check: Check) => () => void;
};

// Collects the checks of the language groups inside a form that saves them.
const LanguageChecksContext = createContext<LanguageChecks | null>(null);

// For the component that saves: provide `checks` around the form, and call
// checkLanguages before saving. It is false while a language is left to translate.
export const useLanguageChecks = () => {
  const registered = useRef(new Set<Check>());

  const checks = useMemo<LanguageChecks>(
    () => ({
      register: (check) => {
        registered.current.add(check);
        return () => {
          registered.current.delete(check);
        };
      },
    }),
    []
  );

  // Runs every check, so each group shows its own error.
  const checkLanguages = useCallback(
    () => [...registered.current].map((check) => check()).every(Boolean),
    []
  );

  return { checks, checkLanguages };
};

export default LanguageChecksContext;
