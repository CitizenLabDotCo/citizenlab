import React, { useState } from 'react';

// components
import {
  Box,
  colors,
  Icon,
  IOption,
  Select,
  Text,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

export const RuleInput = () => {
  const [selectedPage, setSelectedPage] = useState<string | null>('id1');
  const [showRuleInput, setShowRuleInput] = useState<boolean>(false);

  // Get options --> will be all the pages from the field to survey_end
  const options = [
    { value: 'id1', label: 'Page 1' },
    { value: 'id2', label: 'Page 2' },
  ];

  const onStatusChange = (option: IOption) => {
    setSelectedPage(option.value);
  };

  return (
    <SectionField>
      <Box
        mb="0px"
        display="flex"
        borderTop={`1px solid ${colors.divider}`}
        py="8px"
      >
        <Box width="90px" flexGrow={0} flexShrink={0} flexWrap="wrap">
          <Text color={'coolGrey600'} fontSize="s">
            <FormattedMessage {...messages.ruleForAnswerLabel} />
          </Text>
        </Box>
        <Box width="215px" flexGrow={0} flexShrink={0} flexWrap="wrap">
          <Text fontSize="s" fontWeight="bold">
            Lorem ipsum dolor sit
          </Text>
        </Box>
        {!showRuleInput && (
          <Box ml="auto" width="30px" mt="12px" flexGrow={0} flexShrink={0}>
            <Button
              onClick={() => {
                setShowRuleInput(true);
              }}
              buttonStyle="text"
              margin="0px"
              padding="0px"
            >
              <Icon
                width="24px"
                fill={`${colors.coolGrey600}`}
                name="plus-circle"
              />
            </Button>
          </Box>
        )}
      </Box>
      {showRuleInput && (
        <Box display="flex">
          <Box flexGrow={0} flexShrink={0} width="320px">
            <Select
              value={selectedPage}
              options={options}
              label={
                <Text mb="0px" margin="0px" color="coolGrey600" fontSize="s">
                  <FormattedMessage {...messages.goToPageInputLabel} />
                </Text>
              }
              onChange={onStatusChange}
            />
          </Box>
          <Box ml="auto" flexGrow={0} flexShrink={0}>
            <Button
              onClick={() => {
                setSelectedPage(null);
                setShowRuleInput(false);
              }}
              mt="36px"
              buttonStyle="text"
              margin="0px"
              padding="0px"
            >
              <Icon width="24px" fill={`${colors.coolGrey600}`} name="delete" />
            </Button>
          </Box>
        </Box>
      )}
    </SectionField>
  );
};
