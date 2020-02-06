import { IProjectHolderOrderingData } from 'services/projectHolderOrderings';
import useProjectHolderOrderings from 'hooks/useProjectHolderOrderings';
import { isNilOrError } from 'utils/helperUtils';

export type GetProjectHolderOrderingsChildProps = IProjectHolderOrderingData[] | undefined | null | Error;

type children = (renderProps: GetProjectHolderOrderingsChildProps) => JSX.Element | null;

interface Props {
  children?: children;
}

const GetProjectHolderOrderings = ({ children }: Props) => {
  const projectHolderOrderings = useProjectHolderOrderings();

  return (children as children)(isNilOrError(projectHolderOrderings) ? projectHolderOrderings : projectHolderOrderings.data);
};

export default GetProjectHolderOrderings;
