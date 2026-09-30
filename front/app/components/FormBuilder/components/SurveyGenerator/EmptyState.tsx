import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

const STARTERS = [
  messages.starterBikeLanes,
  messages.starterParkRedesign,
  messages.starterFromDocument,
];

type Props = {
  onSelectStarter: (prompt: string) => void;
};

const EmptyState = ({ onSelectStarter }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <Text m="0px" mb="8px">
        <FormattedMessage {...messages.intro} />
      </Text>
      {STARTERS.map((starter) => (
        <ButtonWithLink
          key={starter.id}
          type="button"
          buttonStyle="secondary-outlined"
          icon="stars"
          justify="left"
          whiteSpace="normal"
          width="100%"
          onClick={() => onSelectStarter(formatMessage(starter))}
        >
          {formatMessage(starter)}
        </ButtonWithLink>
      ))}
    </Box>
  );
};

export default EmptyState;
