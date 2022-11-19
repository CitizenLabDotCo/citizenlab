import React, { lazy, Suspense } from 'react';
import { ManagerType, TFilterMenu } from '../../..';

// services
import { IIdeaData } from 'services/ideas';
import { IInitiativeData } from 'services/initiatives';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { IInitiativeStatusData } from 'services/initiativeStatuses';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useLocale from 'hooks/useLocale';

// lazy-loaded components
const IdeaRow = lazy(() => import('./IdeaRow'));
const InitiativeRow = lazy(() => import('./InitiativeRow'));

export const TitleLink = styled.a`
  display: block;
  display: -webkit-box;
  margin: 0 auto;
  &:not(:last-child) {
    margin-bottom: 7px;
  }
  font-size: $font-size;
  line-height: $line-height;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: ${colors.primary};
  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

function nothingHappens(event) {
  event.preventDefault();
  event.stopPropagation();
}

type Props = {
  type: ManagerType;
  post: IIdeaData | IInitiativeData;
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[] | IInitiativeStatusData[];
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  onUnselect: () => void;
  onToggleSelect: () => void;
  onSingleSelect: () => void;
  activeFilterMenu: TFilterMenu;
  openPreview: (ideaId: string) => void;
  className?: string;
};

const Row = ({
  type,
  post,
  selection,
  activeFilterMenu,
  phases,
  statuses,
  className,
  openPreview,
  onToggleSelect,
}: Props) => {
  const locale = useLocale();
  const onClickCheckbox = (event) => {
    event.stopPropagation();
    onToggleSelect();
  };

  const onClickTitle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    openPreview(post.id);
  };

  if (isNilOrError(locale)) {
    return null;
  }

  if (type === 'AllIdeas' || type === 'ProjectIdeas') {
    return (
      <Suspense fallback={null}>
        <IdeaRow
          type={type}
          idea={post as IIdeaData}
          phases={phases}
          statuses={statuses}
          selection={selection}
          activeFilterMenu={activeFilterMenu}
          className={className}
          onClickCheckbox={onClickCheckbox}
          onClickTitle={onClickTitle}
          nothingHappens={nothingHappens}
          locale={locale}
        />
      </Suspense>
    );
  } else if (type === 'Initiatives') {
    return (
      <Suspense fallback={null}>
        <InitiativeRow
          type={type}
          initiative={post as IInitiativeData}
          statuses={statuses as IInitiativeStatusData[]}
          selection={selection}
          activeFilterMenu={activeFilterMenu}
          className={className}
          onClickCheckbox={onClickCheckbox}
          onClickTitle={onClickTitle}
          nothingHappens={nothingHappens}
        />
      </Suspense>
    );
  }
  return null;
};

export default Row;
