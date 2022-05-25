import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import {
  Box,
  Toggle,
  Title,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { Multiloc } from 'typings';

interface Props {
  enabled: boolean;
  titleMultiloc: Multiloc;
  isDefault: boolean;
  onToggleEnabled: (event: React.FormEvent) => void;
}

const StyledText = styled(Text)`
  font-weight: 500;
`;

const StyledIcon = styled(Icon)`
  transform: translateY(-1px);
`;

const Field = ({
  enabled,
  titleMultiloc,
  isDefault,
  onToggleEnabled,
}: Props) => {
  const localize = useLocalize();

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py="20px"
      borderTop={`1px solid ${colors.separation}`}
    >
      <Box display="flex" alignItems="center">
        <Toggle checked={enabled} onChange={onToggleEnabled} />
        <Title variant="h4" as="h3" mt="0px" mb="0px" ml="12px">
          {localize(titleMultiloc)}
        </Title>
      </Box>

      <Box display="flex" alignItems="center">
        {isDefault && (
          <StyledText mt="0px" mb="0px" variant="bodyS" color="adminTextColor">
            <FormattedMessage {...messages.defaultField} />
          </StyledText>
        )}
        <StyledIcon
          name="chevron-right"
          height="12px"
          fill={colors.label}
          ml="16px"
        />
      </Box>
    </Box>
  );
};

export default Field;
