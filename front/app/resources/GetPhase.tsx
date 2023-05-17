import usePhase from 'api/phases/usePhase';
import { IPhaseData } from 'api/phases/types';

interface InputProps {
  id?: string | null;
}

export type GetPhaseChildProps = IPhaseData | undefined | null;

type children = (renderProps: GetPhaseChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

const GetPhase = ({ children, id }: Props) => {
  const { data: phases } = usePhase(id);
  return (children as any)(phases?.data);
};

export default GetPhase;
