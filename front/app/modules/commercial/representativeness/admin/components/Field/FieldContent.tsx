import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import OptionRows from './OptionRows';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  fieldId: string;
}

const FieldContent = ({
  fieldId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => (
  <Box
    background="#FCFCFC"
    width="100%"
    height="100%"
    border={`1px ${colors.separation} solid`}
    pt="20px"
    pb="12px"
    px="16px"
  >
    <Box display="flex">
      <Box width="50%">
        <Title variant="h6" as="h4" mt="0px" mb="8px" color="label">
          {formatMessage(messages.options).toUpperCase()}
        </Title>
      </Box>
      <Box width="50%">
        <Title variant="h6" as="h4" mt="0px" mb="8px" color="label">
          {formatMessage(messages.numberOfTotalResidents).toUpperCase()}
        </Title>
      </Box>
    </Box>

    <OptionRows fieldId={fieldId} />
  </Box>
);

export default injectIntl(FieldContent);
