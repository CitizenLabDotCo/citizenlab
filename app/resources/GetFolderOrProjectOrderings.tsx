import { IFolderOrProjectOrderingData } from 'services/folderOrProjectOrderings';
import useFolderOrProjectOdergings from 'hooks/useFolderOrProjectOrdering';
import { isNilOrError } from 'utils/helperUtils';

export type GetFolderOrProjectOrderingsChildProps = IFolderOrProjectOrderingData[] | undefined | null | Error;

type children = (renderProps: GetFolderOrProjectOrderingsChildProps) => JSX.Element | null;

interface Props {
  children?: children;
}

const GetFolderOrProjectOrderings = ({ children }: Props) => {
  const folderOrProjectOrderings = useFolderOrProjectOdergings();

  return (children as children)(isNilOrError(folderOrProjectOrderings) ? folderOrProjectOrderings
  : folderOrProjectOrderings.data);
};

export default GetFolderOrProjectOrderings;
