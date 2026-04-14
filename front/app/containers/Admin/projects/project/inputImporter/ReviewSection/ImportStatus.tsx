import React from 'react';

import { Box, Text, colors, Spinner } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import Error from 'components/UI/Error';
import ProgressBar from 'components/UI/ProgressBar';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  hasErrors: boolean;
  progress: number;
  total: number;
}

const ImportStatus = ({ hasErrors, progress, total }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  if (hasErrors) {
    return (
      <Container>
        <Error
          text={formatMessage(messages.errorImporting)}
          showIcon={true}
          showBackground={false}
          scrollIntoView={false}
        />
      </Container>
    );
  }

  if (total === 0) {
    return (
      <Container>
        <Box display="flex" alignItems="center">
          <Box mr="8px">
            <Spinner size="20px" />
          </Box>
          <Text m="0" color="black" fontSize="m">
            <FormattedMessage {...messages.importing} />
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Text m="0" mb="8px" color="black" fontSize="m">
        <FormattedMessage
          {...messages.importingProgress}
          values={{ progress, total }}
        />
      </Text>
      <ProgressBar
        progress={progress / total}
        color={theme.colors.primary}
        bgColor={colors.grey200}
      />
    </Container>
  );
};

const Container = ({ children }: { children: React.ReactNode }) => (
  <Box
    py="8px"
    borderBottom={`1px ${colors.grey400} solid`}
    position="relative"
  >
    {children}
  </Box>
);

export default ImportStatus;
