import { useEffect, useMemo } from 'react';

import { IOption } from 'typings';

interface UseAutoCleanupMultiSelectParams {
  value: string[];
  options: IOption[];
  onChange: (ids: string[]) => void;
}

/**
 * Hook that manages multi-select state and automatically removes
 * selected values that are no longer available in the options.
 */
const useAutoCleanupMultiSelect = ({
  value,
  options,
  onChange,
}: UseAutoCleanupMultiSelectParams) => {
  // Clean up selected values that are no longer in the available options
  useEffect(() => {
    if (options.length > 0 && value.length > 0) {
      const availableIds = new Set(options.map((opt) => opt.value));
      const validValues = value.filter((id) => availableIds.has(id));

      // Only update if some values were removed
      if (validValues.length !== value.length) {
        onChange(validValues);
      }
    }
  }, [options, value, onChange]);

  const selectedOptions = useMemo(
    () => options.filter((opt) => value.includes(opt.value)),
    [options, value]
  );

  const handleChange = (newValue: IOption[]) => {
    onChange(newValue.map((opt) => opt.value));
  };

  return {
    selectedOptions,
    handleChange,
  };
};

export default useAutoCleanupMultiSelect;
