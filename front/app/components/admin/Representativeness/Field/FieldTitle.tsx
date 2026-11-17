import React from 'react';

import {
  Box,
  Title,
  Text,
  StatusLabel,
  colors,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import { Status } from '../../../../utils/representativeness/form';

import messages from './messages';

const DefaultStatusLabel = styled(StatusLabel)`
  color: ${colors.coolGrey600};
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

type StatusColor = 'success' | 'textSecondary';

const STATUS_COLORS: Record<Status, StatusColor> = {
  saved: 'success',
  complete: 'success',
  incomplete: 'textSecondary',
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
        <Title color="primary" variant="h4" as="h3" mt="0px" mb="0px" ml="12px">
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
            backgroundColor={colors.textSecondary}
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
