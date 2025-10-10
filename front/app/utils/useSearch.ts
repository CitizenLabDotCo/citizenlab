import { useSearch as useSearchTanstack } from '@tanstack/react-router';

const useSearch = (_options: any) => {
  const params = useSearchTanstack({ strict: false });

  return {
    get: (key: string) => {
      return params[key];
    },
  };
};

export default useSearch;
