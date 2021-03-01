import React, { lazy, Suspense } from 'react';
import { ManagerType, TFilterMenu } from '../..';

// services
import { IIdeaData } from 'services/ideas';
import { IInitiativeData } from 'services/initiatives';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { IInitiativeStatusData } from 'services/initiativeStatuses';

// style
import styled from 'styled-components';

// lazy-loaded components
const IdeaRow = lazy(() => import('./IdeaRow'));
const InitiativeRow = lazy(() => import('./InitiativeRow'));

export const StyledRow = styled.tr<{ undraggable: boolean }>`
  height: 5.7rem !important;
  cursor: ${({ undraggable }) => (undraggable ? 'pointer' : 'move')};
`;

export const FilterCell = styled.td`
  border-top: none !important;
`;

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
  color: black;
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

export default class Row extends React.PureComponent<Props> {
  onClickCheckbox = (event) => {
    event.stopPropagation();
    this.props.onToggleSelect();
  };

  onClickTitle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { post, openPreview } = this.props;
    openPreview(post.id);
  };

  render() {
    const {
      type,
      post,
      selection,
      activeFilterMenu,
      phases,
      statuses,
      className,
    } = this.props;

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
            onClickCheckbox={this.onClickCheckbox}
            onClickTitle={this.onClickTitle}
            nothingHappens={nothingHappens}
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
            onClickCheckbox={this.onClickCheckbox}
            onClickTitle={this.onClickTitle}
            nothingHappens={nothingHappens}
          />
        </Suspense>
      );
    }
    return null;
  }
}
