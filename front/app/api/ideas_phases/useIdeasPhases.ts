import { useQueryClient } from '@tanstack/react-query';
import ideasPhasesKeys from './keys';

const useIdeasPhases = (_ids: string[]) => {
  const queryClient = useQueryClient();

  const data = queryClient.getQueryData([{ type: 'ideas_phase' }]);
  console.log({ data });

  // return data;
  return [];
};

export default useIdeasPhases;
