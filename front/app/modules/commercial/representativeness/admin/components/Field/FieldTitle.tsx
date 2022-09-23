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
import { FormattedMessage } from 'react-intl';

// typings
import { Multiloc } from 'typings';
import { MessageDescriptor } from 'react-intl';
import { Status } from '../../utils/form';

const DefaultStatusLabel = styled(StatusLabel)`
  color: ${colors.clGreyOnGreyBackground};
  font-weight: 700;
  margin-left: 8px;
`;

const ComingSoonStatusLabel = styled(StatusLabel)`
  font-weight: 700;
  margin-left: 8px;
`;

interface Props {
  titleMultiloc: Multiloc;
  isDefault: boolean;
  isComingSoon: boolean;
  isBirthyear: boolean;
  status: Status | null;
  className?: string;
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

const FieldTitle = ({
  titleMultiloc,
  isDefault,
  isComingSoon,
  isBirthyear,
  status,
  className,
}: Props) => {
  const localize = useLocalize();

  return (
    <Box
      py="20px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      className={className}
    >
      <Box display="flex" alignItems="center">
        <Title variant="h4" as="h3" mt="0px" mb="0px" ml="12px">
          {isBirthyear ? (
            <FormattedMessage {...messages.birthyearCustomTitle} />
          ) : (
            <>{localize(titleMultiloc)}</>
          )}
        </Title>
        {isDefault && !isComingSoon && (
          <DefaultStatusLabel
            text={<FormattedMessage {...messages.default} />}
            variant="default"
            backgroundColor={colors.background}
          />
        )}
        {isComingSoon && (
          <ComingSoonStatusLabel
            text={<FormattedMessage {...messages.comingSoon} />}
            variant="default"
            backgroundColor={colors.adminSecondaryTextColor}
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
