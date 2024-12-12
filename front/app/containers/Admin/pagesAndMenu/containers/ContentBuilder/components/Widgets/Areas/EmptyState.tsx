import React from 'react';

import { Title, Text, useBreakpoint } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import { IAreas } from 'api/areas/types';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { useIntl } from 'utils/cl-intl';

import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';

import messages from './messages';

interface Props {
  title: string;
  areas: IAreas;
}

const EmptyState = ({ title, areas }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: appConfiguration } = useAppConfiguration();

  const followedAreas = areas.data.filter(
    (area) => !!area.relationships.user_follower.data?.id
  );

  if (followedAreas.length === 0) return null;
  if (!appConfiguration) return null;

  const { areas_term } = coreSettings(appConfiguration.data);
  const fallback = formatMessage(messages.areas);

  const areasTerm = localize(areas_term, { fallback }).toLowerCase();

  return (
    <CarrouselContainer>
      <Title
        variant="h3"
        mt="0px"
        ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
      >
        {title}
      </Title>
      <Text>
        {followedAreas.length === 1 ? (
          <>
            {formatMessage(messages.thereAreCurrentlyNoProjectsSingular, {
              areaName: localize(followedAreas[0].attributes.title_multiloc),
            })}
          </>
        ) : (
          <>
            {formatMessage(messages.thereAreCurrentlyNoProjectsSingular, {
              areasTerm,
            })}
          </>
        )}
      </Text>
    </CarrouselContainer>
  );
};

export default EmptyState;
