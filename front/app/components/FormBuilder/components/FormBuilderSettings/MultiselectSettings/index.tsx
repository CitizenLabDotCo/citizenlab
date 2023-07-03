import React from 'react';

// components
import {
  Toggle,
  Box,
  IconTooltip,
  Input,
  Label,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const StyledLabel = styled(Label)`
  height: 100%;
  margin-top: autol;
  margin-bottom: auto;
`;

const MultiselectSettings = () => {
  const { formatMessage } = useIntl();
  const [checked, setChecked] = React.useState(false);

  return (
    <Box mb="24px">
      <Box mb="16px">
        <Toggle
          checked={checked}
          onChange={() => setChecked(!checked)}
          label={
            <Box display="flex">
              {formatMessage(messages.limitNumberAnswers)}
              <Box pl="4px">
                <IconTooltip
                  placement="top-start"
                  content={formatMessage(messages.limitNumberAnswersTooltip)}
                />
              </Box>
            </Box>
          }
        />
      </Box>

      {checked && (
        <Box ml="16px">
          <Box mb="8px" display="flex">
            <Box minWidth="100px" my="auto">
              <StyledLabel htmlFor="minimumInput" value="Minimum" />
            </Box>
            <Input id="minimumInput" type="number" size="small" />
          </Box>
          <Box display="flex">
            <Box minWidth="100px" my="auto">
              <StyledLabel
                htmlFor="maximumInput"
                value={formatMessage(messages.maximum)}
              />
            </Box>
            <Input id="maximumInput" type="number" size="small" />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MultiselectSettings;
