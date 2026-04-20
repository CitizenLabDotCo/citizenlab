import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  mb?: string;
}

const LogicCheckbox = ({ mb = '24px' }: Props) => {
  return (
    <CheckboxWithLabel
      name="include_logic"
      label={
        <Text as="span" m="0">
          <FormattedMessage {...messages.includeLogic} />
        </Text>
      }
      labelTooltipText={
        <FormattedMessage {...messages.includeLogicExplanation} />
      }
      mb={mb}
    />
  );
};

export default LogicCheckbox;
