import React from 'react';

import {
  Box,
  Button,
  Title,
  useBreakpoint,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';

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

const AreaSelection = ({ title, areas }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');

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
      <Text>
        {formatMessage(messages.selectYourX, { areaTerm: 'TODO' })} {/* TODO */}
      </Text>
      <Box display="flex" flexDirection="row" gap="12px">
        {areas.data.map((area) => (
          <Button
            buttonStyle="text"
            key={area.id}
            borderColor={colors.textPrimary}
            textColor={colors.textPrimary}
            p="4px 12px"
          >
            {localize(area.attributes.title_multiloc)}
          </Button>
        ))}
      </Box>
    </CarrouselContainer>
  );
};

export default AreaSelection;
