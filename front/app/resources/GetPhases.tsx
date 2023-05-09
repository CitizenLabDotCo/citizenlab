import usePhases from 'api/phases/usePhases';
import { IPhaseData } from 'api/phases/types';

interface InputProps {
  projectId?: string | null | undefined;
  resetOnChange?: boolean;
}

export type GetPhasesChildProps = IPhaseData[] | undefined | null;

type children = (renderProps: GetPhasesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

const GetPhases = ({ children, projectId }: Props) => {
  const { data: phases } = usePhases(projectId);
  return (children as any)(phases);
};

export default GetPhases;
