import React, { lazy, Suspense, MouseEvent } from 'react';
import { ManagerType, TFilterMenu } from '../../..';

// services
import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IInitiativeStatusData } from 'api/initiative_statuses/types';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useLocale from 'hooks/useLocale';

// Types
import { IInitiativeData } from 'api/initiatives/types';

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

function nothingHappens() {}

type Props = {
  type: ManagerType;
  post: IIdeaData | IInitiativeData;
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[] | IInitiativeStatusData[];
  selectedPhaseId?: string | null;
  selectedProjectId?: string | null;
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
  selectedProjectId,
  selectedPhaseId,
  className,
  openPreview,
  onToggleSelect,
}: Props) => {
  const locale = useLocale();
  const onClickCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onToggleSelect();
  };

  const onClickTitle = (event: MouseEvent) => {
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
          statuses={statuses as IIdeaStatusData[]}
          selectedProjectId={selectedProjectId}
          selectedPhaseId={selectedPhaseId}
          phases={phases}
          selection={selection}
          activeFilterMenu={activeFilterMenu}
          className={className}
          onClickCheckbox={onClickCheckbox}
          onClickTitle={onClickTitle}
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
