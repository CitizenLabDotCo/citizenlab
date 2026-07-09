import React from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { ICustomPageData } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';

import EmptyState from '../_shared/EmptyState';
import useLocalizeWithFallback from '../_shared/useLocalizeWithFallback';

import CustomPageCard from './CustomPageCard';
import GridContainer, { Grid } from './GridContainer';
import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  customPages: {
    id: string;
    icon?: string | null;
  }[];
}

const CustomPages = ({ titleMultiloc, customPages }: Props) => {
  const localizeWithFallback = useLocalizeWithFallback();
  const { data: customPagesData, isInitialLoading } = useCustomPages();
  const title = localizeWithFallback(titleMultiloc, messages.defaultTitle);

  const pagesById = new Map(
    customPagesData?.data.map((page) => [page.id, page]) ?? []
  );
  const selectedPages = customPages
    .map((item) => {
      const page = pagesById.get(item.id);
      return page ? { page, icon: item.icon ?? null } : undefined;
    })
    .filter(
      (entry): entry is { page: ICustomPageData; icon: string | null } =>
        entry !== undefined
    );

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
      <Title variant="h2" mt="0px" color="tenantText">
        {title}
      </Title>
      <Grid>
        {selectedPages.map(({ page, icon }) => (
          <CustomPageCard key={page.id} page={page} emoji={icon} />
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
