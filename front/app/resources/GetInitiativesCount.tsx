import { useState } from 'react';

import { IQueryParameters } from 'api/initiative_counts/types';
import useInitiativesCount from 'api/initiative_counts/useInitiativesCount';
export interface InputProps {
  authorId?: string;
  search?: string;
  topics?: string[];
  areas?: string[];
  initiativeStatusId?: string;
  boundingBox?: number[];
  assignee?: string;
  feedbackNeeded?: boolean;
}

type children = (
  renderProps: GetInitiativesCountChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: (obj: GetInitiativesCountChildProps) => JSX.Element | null;
}

export type GetInitiativesCountChildProps = {
  onChangeSearchTerm: (search: string) => void;
  queryParameters: IQueryParameters;
  searchValue: string | undefined;
  count: number | undefined;
  querying: boolean;
};

const GetInitiativesCount = ({
  children,
  authorId,
  search,
  topics,
  areas,
  initiativeStatusId,
  boundingBox,
  assignee,
  feedbackNeeded,
}: Props) => {
  const queryParameters: IQueryParameters = {
    author: authorId,
    search,
    topics,
    areas,
    initiative_status: initiativeStatusId,
    bounding_box: boundingBox,
    assignee,
    feedback_needed: feedbackNeeded,
  };

  const [searchValue, setSearchValue] = useState(search);
  const { data: initiativesCount, isLoading } = useInitiativesCount({
    ...queryParameters,
    search: searchValue,
  });

  const onChangeSearchTerm = (search: string) => {
    setSearchValue(search);
  };

  return (children as children)({
    count: initiativesCount?.data?.attributes?.count,
    searchValue,
    queryParameters,
    querying: isLoading,
    onChangeSearchTerm,
  });
};

export default GetInitiativesCount;
