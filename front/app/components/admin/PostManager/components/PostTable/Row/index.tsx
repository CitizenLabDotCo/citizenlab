import React, { Suspense, MouseEvent } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';

import { ManagerType, TFilterMenu } from '../../..';

import IdeaRow from './IdeaRow';

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

type Props = {
  type: ManagerType;
  post: IIdeaData;
  /** A set of ids of ideas that are currently selected */
  selection: Set<string>;
  activeFilterMenu: TFilterMenu;
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[];
  selectedPhaseId?: string | null;
  selectedProjectId?: string | null;
  onToggleSelect: () => void;
  openPreview: (ideaId: string) => void;
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
        onClickCheckbox={onClickCheckbox}
        onClickTitle={onClickTitle}
        locale={locale}
      />
    </Suspense>
  );
};

export default Row;
