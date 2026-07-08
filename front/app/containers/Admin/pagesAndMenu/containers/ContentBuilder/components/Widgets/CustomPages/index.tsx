import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { ICustomPageData } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';

import CarrouselTitle from '../_shared/CarrouselTitle';
import EmptyState from '../_shared/EmptyState';
import useLocalizeWithFallback from '../_shared/useLocalizeWithFallback';

import CustomPageCard from './CustomPageCard';
import GridContainer, { Grid } from './GridContainer';
import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  customPage: {
    id: string[];
    icon: Record<string, string | null>;
  };
}

const CustomPages = ({ titleMultiloc, customPage }: Props) => {
  const localizeWithFallback = useLocalizeWithFallback();
  const { data: customPages, isInitialLoading } = useCustomPages();
  const title = localizeWithFallback(titleMultiloc, messages.defaultTitle);

  const pagesById = new Map(
    customPages?.data.map((page) => [page.id, page]) ?? []
  );
  const selectedPages = customPage.id
    .map((id) => pagesById.get(id))
    .filter((page): page is ICustomPageData => page !== undefined);

  if (isInitialLoading) {
    return (
      <Box w="100%" display="flex" justifyContent="center" py="24px">
        <Spinner />
      </Box>
    );
  }

  if (selectedPages.length === 0) {
    return <EmptyState title={title} explanation={messages.noData} />;
  }

  return (
    <GridContainer>
      <CarrouselTitle>{title}</CarrouselTitle>
      <Grid>
        {selectedPages.map((page) => (
          <CustomPageCard
            key={page.id}
            page={page}
            emoji={customPage.icon[page.id] ?? null}
          />
        ))}
      </Grid>
    </GridContainer>
  );
};

CustomPages.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.customPagesTitle,
  },
};

export const customPagesTitle = messages.customPagesTitle;

export default CustomPages;
