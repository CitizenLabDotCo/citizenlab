import React from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';

import useCustomPages from 'api/custom_pages/useCustomPages';

import EmptyState from '../_shared/EmptyState';

import CustomPageCard from './CustomPageCard';
import GridContainer, { Grid } from './GridContainer';
import messages from './messages';
import Settings from './Settings';
import useLocalize from 'hooks/useLocalize';
import { Multiloc } from 'typings';
import { CustomPageItem } from './typings';

type CustomPagesProps = {
  titleMultiloc?: Multiloc;
  customPages: CustomPageItem[];
};

const CustomPages = ({ titleMultiloc, customPages }: CustomPagesProps) => {
  const { data: customPagesData, isInitialLoading } = useCustomPages();
  const localize = useLocalize();
  const title = localize(titleMultiloc);

  const pagesById = new Map(
    customPagesData?.data.map((page) => [page.id, page]) ?? []
  );
  const selectedPages = customPages.flatMap((item) => {
    const page = pagesById.get(item.id);
    if (!page) return [];

    return [
      {
        page,
        icon: item.icon ?? null,
        imageUrl: item.image?.imageUrl ?? null,
      },
    ];
  });

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
        {selectedPages.map(({ page, icon, imageUrl }) => (
          <CustomPageCard
            key={page.id}
            page={page}
            emoji={icon}
            imageUrl={imageUrl}
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
