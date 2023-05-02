import {
  IInitiativeData,
  InitiativePublicationStatus,
  IQueryParameters,
  Sort,
} from 'api/initiatives/types';
import useInitiatives from 'api/initiatives/useInitiatives';
import { useState } from 'react';
import {
  getPageNumberFromUrl,
  getSortAttribute,
  getSortDirection,
  SortDirection,
} from 'utils/paginationUtils';

export type SortAttribute = 'new' | 'author_name' | 'upvotes_count' | 'status';

export type PublicationStatus = InitiativePublicationStatus;

export interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  authorId?: string;
  sort?: Sort;
  search?: string;
  topics?: string[];
  areas?: string[];
  initiativeStatusId?: string;
  publicationStatus?: PublicationStatus;
  boundingBox?: number[];
  assignee?: string;
  feedbackNeeded?: boolean;
}

type children = (renderProps: GetInitiativesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: (obj: GetInitiativesChildProps) => JSX.Element | null;
}

export type GetInitiativesChildProps = {
  onChangePage: (pageNumber: number) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangeSorting: (sort: Sort) => void;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeStatus: (initiativeStatus: string | null) => void;
  onChangePublicationStatus: (publicationStatus: PublicationStatus) => void;
  onChangeAssignee: (assignee: string | undefined) => void;
  onChangeFeedbackFilter: (feedbackNeeded: boolean) => void;
  list: IInitiativeData[] | undefined | null;
  onResetParams: (paramsToOmit?: (keyof IQueryParameters)[]) => void;
  queryParameters: IQueryParameters;
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  currentPage: number;
  lastPage: number;
};

const GetInitiatives = ({ children }: Props) => {
  const [filter, setFilters] = useState<IQueryParameters>({});
  const { data: initiatives } = useInitiatives(filter);

  const onChangeTopics = (topics: string[]) => {
    setFilters({ ...filter, topics });
  };
  const onChangeStatus = (initiativeStatus: string | null) => {
    setFilters({ ...filter, initiative_status: initiativeStatus });
  };
  const onChangeAssignee = (assignee: string | undefined) => {
    setFilters({ ...filter, assignee });
  };

  const onChangeFeedbackFilter = (feedbackNeeded: boolean) => {
    setFilters({ ...filter, feedback_needed: feedbackNeeded });
  };

  const onResetParams = () => {
    setFilters({});
  };

  const onChangePage = (pageNumber: number) => {
    setFilters({ ...filter, pageNumber });
  };

  const onChangeSearchTerm = (search: string) => {
    setFilters({ ...filter, search });
  };

  const onChangeSorting = (sort: Sort) => {
    setFilters({ ...filter, sort });
  };

  const onChangeAreas = (areas: string[]) => {
    setFilters({ ...filter, areas });
  };

  const onChangePublicationStatus = (publicationStatus: PublicationStatus) => {
    setFilters({ ...filter, publication_status: publicationStatus });
  };

  const currentPage =
    initiatives?.links.self && getPageNumberFromUrl(initiatives?.links?.self);

  const lastPage =
    initiatives?.links.last && getPageNumberFromUrl(initiatives?.links?.last);

  return (children as children)({
    list: initiatives?.data,
    onChangePage,
    onChangeSearchTerm,
    onChangeSorting,
    onChangeTopics,
    onChangeAreas,
    onChangeStatus,
    onChangePublicationStatus,
    onChangeAssignee,
    onChangeFeedbackFilter,
    onResetParams,
    queryParameters: filter,
    currentPage: currentPage || 1,
    lastPage: lastPage || 1,
    sortAttribute: filter.sort
      ? getSortAttribute<Sort, SortAttribute>(filter.sort)
      : 'new',
    sortDirection: filter.sort
      ? getSortDirection<Sort>(filter.sort)
      : 'ascending',
  });
};

export default GetInitiatives;
