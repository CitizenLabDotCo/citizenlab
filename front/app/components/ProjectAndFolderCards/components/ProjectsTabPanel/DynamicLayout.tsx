import React, { useState, useEffect } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { isEqual } from 'lodash-es';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';

import ProjectCard from 'components/ProjectCard';

import { PublicationTab } from '../..';
import getCardSizes from '../getCardSizes';
import ProjectFolderCard from '../ProjectFolderCard';
import { BaseProps, TCardSize } from '../PublicationStatusTabs';
import { getTabId, getTabPanelId } from '../Topbar/Tabs';

const Container = styled.div<{ hide: boolean }>`
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  flex-wrap: wrap;
  justify-content: space-between;
`;

interface Props extends Omit<BaseProps, 'layout'> {
  tab: PublicationTab;
  hasMoreThanOneTab: boolean;
}

const DynamicLayout = ({ tab, currentTab, list, hasMoreThanOneTab }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const isLargerThanTablet = !isSmallerThanTablet;
  const [cardSizes, setCardSizes] = useState<TCardSize[]>([]);
  const layout = 'dynamic';

  useEffect(() => {
    if (list.length > 0) {
      const newCardSizes = getCardSizes(list.length, isLargerThanTablet);

      if (!isEqual(cardSizes, newCardSizes)) {
        setCardSizes(newCardSizes);
      }
    }
  }, [list.length, layout, cardSizes, isLargerThanTablet]);
  return (
    // The id, aria-labelledby, hidden and hide are necessary
    // for the tab system to work well with screen readers.
    // See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
    <Container
      id={getTabPanelId(tab)}
      role={hasMoreThanOneTab ? 'tabpanel' : undefined}
      className={`e2e-projects-list ${tab === currentTab ? 'active-tab' : ''}`}
      aria-labelledby={hasMoreThanOneTab ? `${getTabId(tab)}` : undefined}
      hidden={tab !== currentTab}
      hide={tab !== currentTab}
    >
      {list.map((item: IAdminPublicationData, index: number) => {
        const projectOrFolderId = item.relationships.publication.data.id;
        const projectOrFolderType = item.relationships.publication.data.type;
        const size = cardSizes[index];

        if (projectOrFolderType === 'project') {
          return (
            <ProjectCard
              key={index}
              projectId={projectOrFolderId}
              size={size}
              layout={layout}
            />
          );
        }

        return (
          <ProjectFolderCard
            key={index}
            folderId={projectOrFolderId}
            size={size}
            layout={layout}
          />
        );
      })}
    </Container>
  );
};

export default DynamicLayout;
