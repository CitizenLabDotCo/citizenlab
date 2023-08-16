import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Topics from 'containers/UsersShowPage/Following/Topics';
import Areas from 'containers/UsersShowPage/Following/Areas';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  onSkip: () => void;
}

const TopicsAndAreas = ({ onSkip }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Box>
        <Title variant="h4">{formatMessage(messages.topicsOfInterest)}</Title>
        <Topics />
      </Box>
      <Box>
        <Title variant="h4">{formatMessage(messages.areasOfFocus)}</Title>
        <Areas />
      </Box>
      <Button onClick={onSkip} my="20px" w="auto">
        {formatMessage(messages.skip)}
      </Button>
    </>
  );
};

export default TopicsAndAreas;
