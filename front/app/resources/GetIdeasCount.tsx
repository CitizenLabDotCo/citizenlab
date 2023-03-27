import { useState, useMemo } from 'react';
import { debounce } from 'lodash-es';

// hooks
import useIdeasCount from 'api/idea_count/useIdeasCount';
import { IQueryParameters } from 'api/idea_count/types';

// typings
import { NilOrError } from 'utils/helperUtils';

type children = (renderProps: GetIdeasCountChildProps) => JSX.Element | null;

interface Props extends IQueryParameters {
  children?: (obj: GetIdeasCountChildProps) => JSX.Element | null;
}

export interface GetIdeasCountChildProps {
  count: number | NilOrError;
  onChangeSearchTerm: (search: string) => void;
}

const GetIdeasCount = ({ children, search, ...otherProps }: Props) => {
  const [currentSearch, setCurrentSearch] = useState(search);
  const { data: count } = useIdeasCount({
    search: currentSearch,
    ...otherProps,
  });

  const onChangeSearchTerm = useMemo(
    () =>
      debounce((search: string) => {
        setCurrentSearch(search);
      }, 500),
    []
  );

  return (children as children)({
    count: count?.data.attributes.count,
    onChangeSearchTerm,
  });
};

export default GetIdeasCount;
