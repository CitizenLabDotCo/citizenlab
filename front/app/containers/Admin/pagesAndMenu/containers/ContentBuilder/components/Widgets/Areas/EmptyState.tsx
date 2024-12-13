import React from 'react';

import {
  Title,
  Text,
  Box,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import { IAreaData } from 'api/areas/types';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { useIntl } from 'utils/cl-intl';

import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';

import messages from './messages';

interface Props {
  title: string;
  followedAreas: IAreaData[];
}

const EmptyState = ({ title, followedAreas }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  const { areas_term } = coreSettings(appConfiguration.data);
  const fallback = formatMessage(messages.areas);

  const areasTerm = localize(areas_term, { fallback }).toLowerCase();

  const getMessage = () => {
    if (followedAreas.length === 1) {
      return formatMessage(messages.thereAreCurrentlyNoProjectsSingular, {
        areaName: localize(followedAreas[0].attributes.title_multiloc),
      });
    }

    return formatMessage(messages.thereAreCurrentlyNoProjectsPlural, {
      areasTerm,
    });
  };

  return (
    <CarrouselContainer>
      <Box ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}>
        <Title variant="h2" mt="0px" color="tenantText">
          {title}
        </Title>
        <Text color="textSecondary">{getMessage()}</Text>
      </Box>
    </CarrouselContainer>
  );
};

export default EmptyState;
