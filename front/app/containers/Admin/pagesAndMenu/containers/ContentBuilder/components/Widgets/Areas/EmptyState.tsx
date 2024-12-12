import React from 'react';

import {
  Title,
  Text,
  useBreakpoint,
  Box,
} from '@citizenlab/cl2-component-library';

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
  selectedAreaId?: string;
}

const EmptyState = ({ title, areas, selectedAreaId }: Props) => {
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

  const getMessage = () => {
    if (selectedAreaId) {
      const area = areas.data.find((area) => area.id === selectedAreaId);
      if (!area) return null;

      return formatMessage(messages.thereAreCurrentlyNoProjectsSingular, {
        areaName: localize(area.attributes.title_multiloc),
      });
    }

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
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        mb="16px"
      >
        <Title
          variant="h2"
          my="0px"
          ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        >
          {title}
        </Title>
        {/* <Box display="flex" alignItems="center">
          <DropdownSelect
            selectedAreaId={selectedAreaId}
            areas={areas}
            onSelectArea={onSelectArea}
          />
        </Box> */}
      </Box>
      <Text color="textSecondary">{getMessage()}</Text>
    </CarrouselContainer>
  );
};

export default EmptyState;
