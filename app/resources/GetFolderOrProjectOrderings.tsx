import { IProjectHolderOrderingData } from 'services/projectHolderOrderings';
import useFolderOrProjectOrderings from 'hooks/useProjectHolderOrderings';
import { isNilOrError } from 'utils/helperUtils';

type GetProjectHolderOrderingsChildProps = IProjectHolderOrderingData[] | undefined | null | Error;

type children = (renderProps: GetProjectHolderOrderingsChildProps) => JSX.Element | null;

interface Props {
  children?: children;
}

const GetProjectHolderOrderings = ({ children }: Props) => {
  const folderOrProjectOrderings = useFolderOrProjectOrderings();

  return (children as children)(isNilOrError(folderOrProjectOrderings) ? folderOrProjectOrderings
  : folderOrProjectOrderings.data);
};

export default GetProjectHolderOrderings;
