import React from 'react';

import {
  Box,
  Text,
  Icon,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

const OptionCard = styled.button<{ highlighted?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border-radius: ${stylingConsts.borderRadius};
  border: 1px solid
    ${({ highlighted }) => (highlighted ? colors.blue500 : colors.grey300)};
  background: ${({ highlighted }) =>
    highlighted ? colors.teal50 : colors.white};
  cursor: pointer;
  flex: 1;
  text-align: left;

  &:hover {
    border-color: ${colors.blue500};
    background: ${colors.teal50};
  }
`;

type Props = {
  onStartFromScratch: () => void;
  onDuplicateExisting: () => void;
};

const NewSurveyEmptyState = ({
  onStartFromScratch,
  onDuplicateExisting,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      background={colors.white}
      borderRadius={stylingConsts.borderRadius}
      maxWidth="600px"
      w="100%"
      mx="auto"
      mt="120px"
      p="32px"
    >
      <Title variant="h2" color="primary" textAlign="center" mb="24px" mt="0">
        {formatMessage(messages.newSurvey)}
      </Title>
      <Box display="flex" gap="16px" mb="40px">
        <OptionCard onClick={onStartFromScratch} highlighted>
          <Icon
            name="plus-circle"
            fill={colors.teal500}
            width="24px"
            height="24px"
          />
          <Text
            fontWeight="bold"
            mt="12px"
            mb="4px"
            fontSize="m"
            color="blue500"
          >
            {formatMessage(messages.startFromScratch)}
          </Text>
          <Text fontSize="s" color="blue500" m="0">
            {formatMessage(messages.startFromScratchDescription)}
          </Text>
        </OptionCard>
        <OptionCard onClick={onDuplicateExisting}>
          <Icon
            name="copy"
            fill={colors.coolGrey500}
            width="24px"
            height="24px"
          />
          <Text
            fontWeight="bold"
            mt="12px"
            mb="4px"
            fontSize="m"
            color="coolGrey500"
          >
            {formatMessage(messages.duplicateExisting)}
          </Text>
          <Text fontSize="s" color="coolGrey500" m="0">
            {formatMessage(messages.duplicateExistingDescription)}
          </Text>
        </OptionCard>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        background={colors.white}
        borderRadius={stylingConsts.borderRadius}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgColor={colors.blue10}
          p="8px"
          borderRadius={stylingConsts.borderRadius}
        >
          <Icon name="form-sync" fill={colors.blue500} />
        </Box>
        <Text color="coolGrey700" fontSize="s" m="0px">
          <FormattedMessage
            {...messages.planningInPersonEvent}
            values={{ b: (chunks) => <b>{chunks}</b> }}
          />
        </Text>
      </Box>
    </Box>
  );
};

export default NewSurveyEmptyState;
