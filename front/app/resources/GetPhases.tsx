import usePhases from 'api/phases/usePhases';
import { IPhaseData } from 'api/phases/types';

interface InputProps {
  projectId?: string | null | undefined;
}

export type GetPhasesChildProps = IPhaseData[] | undefined;

type children = (renderProps: GetPhasesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

const GetPhases = ({ children, projectId }: Props) => {
  const { data: phases } = usePhases(projectId ?? undefined);
  return (children as any)(phases?.data);
};

export default GetPhases;
