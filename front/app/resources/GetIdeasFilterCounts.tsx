// hooks
import useIdeasFilterCounts from 'hooks/useIdeasFilterCounts';

// typings
import { NilOrError } from 'utils/helperUtils';
import {
  IIdeasFilterCountsQueryParameters,
  IIdeasFilterCounts,
} from 'services/ideas';

type children = (
  renderProps: GetIdeasFilterCountsChildProps
) => JSX.Element | null;

interface Props {
  queryParameters: IIdeasFilterCountsQueryParameters | null;
  children?: children;
}

export type GetIdeasFilterCountsChildProps = IIdeasFilterCounts | NilOrError;

const GetIdeasFilterCounts = ({ children, queryParameters }: Props) => {
  const ideasFilterCounts = useIdeasFilterCounts(queryParameters);
  return (children as children)(ideasFilterCounts);
};

export default GetIdeasFilterCounts;
