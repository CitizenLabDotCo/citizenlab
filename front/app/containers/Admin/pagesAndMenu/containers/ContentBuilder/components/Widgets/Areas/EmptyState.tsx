import React from 'react';

import {
  Title,
  Text,
  Box,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { useIntl } from 'utils/cl-intl';

import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';

import messages from './messages';

interface Props {
  title: string;
}

const EmptyState = ({ title }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  return (
    <CarrouselContainer>
      <Box ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}>
        <Title variant="h2" mt="0px" color="tenantText">
          {title}
        </Title>
        <Text color="textSecondary">
          {formatMessage(messages.thereAreCurrentlyNoProjectsPlural, {
            areasTerm: localize(coreSettings(appConfiguration.data).area_term, {
              fallback: formatMessage(messages.areas),
            }).toLowerCase(),
          })}
        </Text>
      </Box>
    </CarrouselContainer>
  );
};

export default EmptyState;
