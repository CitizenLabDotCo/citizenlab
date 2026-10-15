import { useSearch } from 'utils/router';

// The order of the projects on every level: the one picked from a column
// header, else as arranged.
const useProjectSort = () => {
  const { sort } = useSearch({ from: '/$locale/admin/projects/' });
  return sort ?? 'arranged';
};

export default useProjectSort;
