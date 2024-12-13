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
import useProjectCountsByArea from 'api/areas/useProjectCountsByArea';
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
  const { data: projectCountsByArea } = useProjectCountsByArea();

  const { mutate: addFollower, isLoading } = useAddFollower();

  if (!appConfiguration || !projectCountsByArea) return null;

  const { area_term } = coreSettings(appConfiguration.data);
  const fallback = formatMessage(projectAndFolderCardsMessages.areaTitle);

  const areaTerm = localize(area_term, { fallback }).toLowerCase();

  const { counts } = projectCountsByArea.data.attributes;

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
      <Text>{formatMessage(messages.selectYourX, { areaTerm })}</Text>
      <Box>
        {counts.map((area, i) => (
          <Box
            display="inline-block"
            mr={i === counts.length - 1 ? '0px' : '8px'}
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
              {`${localize(area.title_multiloc)} (${area.count})`}
            </Button>
          </Box>
        ))}
      </Box>
    </CarrouselContainer>
  );
};

export default AreaSelection;
