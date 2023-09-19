import useIdeasPhase from './useIdeasPhase';

const useIdeasPhases = (ids: string[]) => {
  return ids.map(useIdeasPhase).map((ideasPhase) => ideasPhase.data);
};

export default useIdeasPhases;
