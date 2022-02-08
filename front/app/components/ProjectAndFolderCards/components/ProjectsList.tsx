import React, { useState, useEffect } from 'react';

// components
import ProjectsTabPanel from './ProjectsTabPanel';

// hooks
import { useWindowSize } from '@citizenlab/cl2-component-library';

// types
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { TLayout } from '..';
import { PublicationTab } from '../';

// utils
import getCardSizes from './getCardSizes';
import { isEqual } from 'lodash-es';

export type TCardSize = 'small' | 'medium' | 'large';

export interface BaseProps {
  currentTab: PublicationTab;
  list: IAdminPublicationContent[];
  layout: TLayout;
  hasMore: boolean;
}

interface Props extends BaseProps {
  availableTabs: PublicationTab[];
}

const ProjectsList = ({
  currentTab,
  availableTabs,
  list,
  layout,
  hasMore,
}: Props) => {
  const { windowWidth } = useWindowSize();

  const [cardSizes, setCardSizes] = useState<TCardSize[]>([]);

  useEffect(() => {
    if (list.length > 0 && layout === 'dynamic') {
      const newCardSizes = getCardSizes(list.length, windowWidth);

      if (!isEqual(cardSizes, newCardSizes)) {
        setCardSizes(newCardSizes);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, layout]);

  return (
    <>
      {availableTabs.map((tab) => (
        <ProjectsTabPanel
          key={tab}
          currentTab={currentTab}
          tab={tab}
          list={list}
          layout={layout}
          cardSizes={cardSizes}
          hasMore={hasMore}
        />
      ))}
    </>
  );
};

export default ProjectsList;
