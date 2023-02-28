import { useState, useMemo } from 'react';
import { debounce } from 'lodash-es';

// hooks
import useIdeasCount, { Props as InputProps } from 'hooks/useIdeasCount';

// typings
import { NilOrError } from 'utils/helperUtils';

type children = (renderProps: GetIdeasCountChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: (obj: GetIdeasCountChildProps) => JSX.Element | null;
}

export interface GetIdeasCountChildProps {
  count: number | NilOrError;
  onChangeSearchTerm: (search: string) => void;
}

const GetIdeasCount = ({ children, search, ...otherProps }: Props) => {
  const [currentSearch, setCurrentSearch] = useState(search);
  const count = useIdeasCount({
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
    count,
    onChangeSearchTerm,
  });
};

export default GetIdeasCount;
