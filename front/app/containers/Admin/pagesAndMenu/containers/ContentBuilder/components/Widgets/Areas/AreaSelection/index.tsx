import React from 'react';

import {
  Box,
  Button,
  Title,
  useBreakpoint,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import useAreasWithProjectCounts from 'api/areas/useAreasWithProjectsCounts';
import useAddFollower from 'api/follow_unfollow/useAddFollower';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import projectAndFolderCardsMessages from 'components/ProjectAndFolderCards/components/Topbar/messages';

import { useIntl } from 'utils/cl-intl';

import { CarrouselContainer } from '../../_shared/BaseCarrousel/Containers';
import messages from '../messages';

interface Props {
  title: string;
}

const AreaSelection = ({ title }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { data: appConfiguration } = useAppConfiguration();
  const { data: areasWithProjectCount } = useAreasWithProjectCounts();

  const { mutate: addFollower, isLoading } = useAddFollower();

  if (!appConfiguration || !areasWithProjectCount) return null;

  return (
    <CarrouselContainer>
      <Title
        variant="h2"
        mt="0px"
        ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        color="tenantText"
      >
        {title}
      </Title>
      <Box ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}>
        <Text>
          {formatMessage(messages.selectYourX, {
            areaTerm: localize(coreSettings(appConfiguration.data).area_term, {
              fallback: formatMessage(projectAndFolderCardsMessages.areaTitle),
            }).toLowerCase(),
          })}
        </Text>
        <Box>
          {areasWithProjectCount.data.map((area, i) => (
            <Box
              display="inline-block"
              mr={i === areasWithProjectCount.data.length - 1 ? '0px' : '8px'}
              mb="8px"
              key={area.id}
            >
              <Button
                buttonStyle="text"
                borderColor={colors.textPrimary}
                textColor={colors.textPrimary}
                p="4px 12px"
                processing={isLoading}
                disabled={isLoading}
                bgHoverColor={colors.grey200}
                textHoverColor={colors.black}
                onClick={() => {
                  addFollower({
                    followableType: 'areas',
                    followableId: area.id,
                  });
                }}
              >
                {`${localize(area.attributes.title_multiloc)} (${
                  area.attributes.visible_projects_count
                })`}
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </CarrouselContainer>
  );
};

export default AreaSelection;
