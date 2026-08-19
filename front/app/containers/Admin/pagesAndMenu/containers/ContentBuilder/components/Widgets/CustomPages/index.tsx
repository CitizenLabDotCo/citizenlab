import React from 'react';

import { Box, Shimmer, Title, colors } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useCustomPages from 'api/custom_pages/useCustomPages';

import useLocalize from 'hooks/useLocalize';

import EmptyState from '../_shared/EmptyState';

import { CARD_ICON_SIZE } from './constants';
import CustomPageCard from './CustomPageCard';
import GridContainer, { Grid } from './GridContainer';
import messages from './messages';
import Settings from './Settings';
import { CustomPageItem } from './typings';

type SkeletonProps = {
  title: string;
  customPages: CustomPageItem[];
};

const Skeleton = ({ title, customPages }: SkeletonProps) => (
  <GridContainer>
    <Title variant="h2" mt="0px" color="tenantText">
      {title}
    </Title>
    <Grid>
      {customPages.map((item) => (
        <Box
          key={item.id}
          display="flex"
          alignItems="center"
          gap="16px"
          p="20px"
          border={`1px solid ${colors.coolGrey300}`}
          borderRadius="12px"
        >
          {(item.icon || item.image?.imageUrl) && (
            <Shimmer
              flex="0 0 auto"
              w={`${CARD_ICON_SIZE}px`}
              h={`${CARD_ICON_SIZE}px`}
              borderRadius="4px"
            />
          )}
          <Shimmer w="60%" h="16px" borderRadius="16px" />
        </Box>
      ))}
    </Grid>
  </GridContainer>
);

type CustomPagesProps = {
  titleMultiloc?: Multiloc;
  customPages: CustomPageItem[];
};

const CustomPages = ({ titleMultiloc, customPages }: CustomPagesProps) => {
  const { data: customPagesData, isLoading } = useCustomPages();
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

  // Nothing selected in the settings panel: no fetch result can change that, so
  // there is nothing to show a skeleton for.
  if (customPages.length === 0) {
    return <EmptyState title={title} explanation={messages.noData} />;
  }

  if (isLoading) {
    return <Skeleton title={title} customPages={customPages} />;
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
