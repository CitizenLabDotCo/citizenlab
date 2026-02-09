import React from 'react';

import {
  Box,
  IconTooltip,
  Radio,
  Text,
} from '@citizenlab/cl2-component-library';

import { UserFieldsInFormFrontendDescriptor } from 'api/phase_permissions/types';

import Warning from 'components/UI/Warning';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import { EXPLANATION_MESSAGES } from './constants';
import messages from './messages';

interface Props {
  user_fields_in_form_frontend_descriptor: UserFieldsInFormFrontendDescriptor;
  onChange: (userFieldsInForm: boolean) => void;
}

const UserFieldsInFormRadio = ({
  user_fields_in_form_frontend_descriptor,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();

  const { value, locked, explanation } =
    user_fields_in_form_frontend_descriptor;

  return (
    <>
      <Box pt="16px">
        <Radio
          name="user_fields_in_registration_flow"
          value={false}
          currentValue={value}
          label={
            <Box display="flex" alignItems="center">
              <Text color="primary" m="0">
                <FormattedMessage
                  {...messages.askDemographicQuestionsBeforeUserParticipates}
                />
              </Text>
              <IconTooltip
                ml="4px"
                content={
                  <FormattedMessage
                    {...messages.askDemographicQuestionsBeforeUserParticipatesTooltip}
                  />
                }
              />
            </Box>
          }
          onChange={onChange}
          disabled={!!locked}
        />
        <Radio
          name="user_fields_in_form"
          value={true}
          currentValue={value}
          label={
            <Box display="flex" alignItems="center">
              <Text color="primary" m="0">
                <FormattedMessage
                  {...messages.collectDemographicsByAddingNewPage}
                />
              </Text>
              <IconTooltip
                ml="4px"
                content={
                  <FormattedMessage
                    {...messages.collectDemographicsByAddingNewPageTooltip}
                  />
                }
              />
            </Box>
          }
          onChange={onChange}
          mr="8px"
          disabled={!!locked}
        />
      </Box>
      {explanation && (
        <Box mb="16px">
          <Warning>{formatMessage(EXPLANATION_MESSAGES[explanation])}</Warning>
        </Box>
      )}
    </>
  );
};

export default UserFieldsInFormRadio;
