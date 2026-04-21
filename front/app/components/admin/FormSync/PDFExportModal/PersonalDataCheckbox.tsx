import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  mb?: string;
}

const PersonalDataCheckbox = ({ mb = '24px' }: Props) => {
  return (
    <CheckboxWithLabel
      name="print_personal_data_fields"
      label={
        <Text as="span" m="0">
          <FormattedMessage {...messages.askPersonalData3} />
        </Text>
      }
      labelTooltipText={
        <FormattedMessage {...messages.personalDataExplanation5} />
      }
      mb={mb}
    />
  );
};

export default PersonalDataCheckbox;
