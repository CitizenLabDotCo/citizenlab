import React from 'react';
// hooks
import useLocalize from 'hooks/useLocalize';

// components
import {
  Box,
  Title,
  Text,
  StatusLabel,
} from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { Multiloc, MessageDescriptor } from 'typings';
import { Status } from './utils';

const StyledStatusLabel = styled(StatusLabel)`
  color: ${colors.clGreyOnGreyBackground};
  font-weight: 700;
  margin-left: 8px;
`;

interface Props {
  titleMultiloc: Multiloc;
  isDefault: boolean;
  status: Status | null;
}

const STATUS_MESSAGES: Record<Status, MessageDescriptor> = {
  saved: messages.saved,
  complete: messages.complete,
  incomplete: messages.incomplete,
};

type StatusColor = 'clGreenSuccess' | 'label';

const STATUS_COLORS: Record<Status, StatusColor> = {
  saved: 'clGreenSuccess',
  complete: 'clGreenSuccess',
  incomplete: 'label',
};

const FieldTitle = ({ titleMultiloc, isDefault, status }: Props) => {
  const localize = useLocalize();

  return (
    <Box
      py="20px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <Box display="flex" alignItems="center">
        <Title variant="h4" as="h3" mt="0px" mb="0px" ml="12px">
          {localize(titleMultiloc)}
        </Title>
        {isDefault && (
          <StyledStatusLabel
            text={<FormattedMessage {...messages.default} />}
            variant="default"
            backgroundColor={colors.background}
          />
        )}
      </Box>

      {status && (
        <Text mt="0px" mb="0px" variant="bodyS" color={STATUS_COLORS[status]}>
          <FormattedMessage {...STATUS_MESSAGES[status]} />
        </Text>
      )}
    </Box>
  );
};

export default FieldTitle;
