import React from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

import useAreasWithProjectCounts from 'api/areas/useAreasWithProjectsCounts';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import UpdateFollowAreaWithProjects from 'components/Areas/FollowArea/UpdateFollowAreaWithProjects';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import { CarrouselContainer } from '../../_shared/BaseCarrousel/Containers';
import messages from '../messages';

interface Props {
  title: string;
}

const AreaSelection = ({ title }: Props) => {
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { data: areasWithProjectCount } = useAreasWithProjectCounts();

  if (!areasWithProjectCount) return null;

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
        <Box mb="24px">
          <Warning>{formatMessage(messages.areaButtonsInfo)}</Warning>
        </Box>
        <Box>
          {areasWithProjectCount.data.map((area, i) => (
            <Box
              display="inline-block"
              mr={i === areasWithProjectCount.data.length - 1 ? '0px' : '8px'}
              mb="8px"
              key={area.id}
            >
              <UpdateFollowAreaWithProjects area={area} />
            </Box>
          ))}
        </Box>
      </Box>
    </CarrouselContainer>
  );
};

export default AreaSelection;
