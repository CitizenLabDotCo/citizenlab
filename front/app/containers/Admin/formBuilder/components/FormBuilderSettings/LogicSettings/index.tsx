import React from 'react';

// components
import { Box, colors, Locale } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { RuleInput } from './RuleInput';

// intl
import messages from '../../messages';
import { useIntl } from 'utils/cl-intl';

// services & hooks
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';

export const LogicSettings = (
  field: IFlatCustomFieldWithIndex,
  locales: Locale[]
) => {
  const { formatMessage } = useIntl();

  // Get all the question options, and map each to a RuleInput

  // statuses.map((status) => ({
  //   value: status.id,
  //   label: localize(status.attributes.title_multiloc),
  // }));

  console.log('FIELD: ', field);

  // If linear scale

  // If select or multiselect
  // get field.maximum, questions are then "1, 2, 3, 4 ... maximum"
  const options = Array.from({ length: field.maximum }, (_, i) => i + 1);
  console.log({ options });
  return (
    <>
      <Box mb="24px">
        <Warning text={formatMessage(messages.logicWarning)} />
      </Box>
      {/* For each option in the field, provide the rule input */}
      <RuleInput />
      <Box borderTop={`1px solid ${colors.divider}`} py="24px" />
    </>
  );
};
