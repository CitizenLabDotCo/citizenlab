import { useEffect } from 'react';

import { FieldErrors, FieldValues } from 'react-hook-form';

/**
 * Hook to automatically focus the first invalid field in a form
 * Usage: Call this in your form component and pass the errors object from useForm
 *
 * @param errors - The errors object from React Hook Form
 * @param submitCount - The submit count from React Hook Form (optional, for better timing)
 */
export const useFocusFirstInvalid = <T extends FieldValues>(
  errors: FieldErrors<T>,
  submitCount?: number
) => {
  useEffect(() => {
    const firstErrorField = Object.keys(errors)[0];

    if (!firstErrorField) return;

    // Try multiple selectors to find the field
    const selectors = [
      `[name="${firstErrorField}"]`,
      `[id*="${firstErrorField}"]`,
      `[data-testid="${firstErrorField}"]`,
      `.e2e-${firstErrorField}`,
      `input[name="${firstErrorField}"]`,
      `textarea[name="${firstErrorField}"]`,
      `select[name="${firstErrorField}"]`,
    ];

    let element: HTMLElement | null = null;

    for (const selector of selectors) {
      element = document.querySelector<HTMLElement>(selector);
      if (element) break;
    }

    if (element) {
      // Focus the element
      element.focus();

      // Scroll into view with smooth behavior
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [errors, submitCount]);
};

export default useFocusFirstInvalid;
