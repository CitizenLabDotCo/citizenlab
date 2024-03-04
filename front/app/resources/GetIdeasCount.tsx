import { useState, useMemo } from 'react';
import { debounce } from 'lodash-es';

import useIdeasCount from 'api/idea_count/useIdeasCount';
import { IQueryParameters } from 'api/idea_count/types';

import { NilOrError } from 'utils/helperUtils';

type children = (renderProps: GetIdeasCountChildProps) => JSX.Element | null;

interface Props extends IQueryParameters {
  feedbackNeeded?: boolean;
  ideaStatusId?: string;
  children?: (obj: GetIdeasCountChildProps) => JSX.Element | null;
}

export interface GetIdeasCountChildProps {
  count: number | NilOrError;
  onChangeSearchTerm: (search: string) => void;
}

const GetIdeasCount = ({
  children,
  search,
  feedbackNeeded,
  ideaStatusId,
  ...otherProps
}: Props) => {
  const [currentSearch, setCurrentSearch] = useState(search);
  const { data: count } = useIdeasCount({
    search: currentSearch,
    feedback_needed: feedbackNeeded,
    idea_status_id: ideaStatusId,
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
