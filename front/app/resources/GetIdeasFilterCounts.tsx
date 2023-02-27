// hooks
import useIdeasFilterCounts from 'hooks/useIdeasFilterCounts';

// typings
import { NilOrError } from 'utils/helperUtils';
import { IIdeasQueryParameters, IIdeasFilterCounts } from 'services/ideas';

type children = (
  renderProps: GetIdeasFilterCountsChildProps
) => JSX.Element | null;

interface Props {
  queryParameters: IIdeasQueryParameters | null;
  children?: children;
}

type GetIdeasFilterCountsChildProps = IIdeasFilterCounts | NilOrError;

const GetIdeasFilterCounts = ({ children, queryParameters }: Props) => {
  const ideasFilterCounts = useIdeasFilterCounts(queryParameters);
  return (children as children)(ideasFilterCounts);
};

export default GetIdeasFilterCounts;
