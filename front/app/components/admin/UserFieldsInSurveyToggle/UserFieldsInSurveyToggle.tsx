import React from 'react';

import { Toggle, Text, Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface UserFieldsInSurveyToggleProps {
  user_fields_in_form: boolean | null | undefined;
  handleUserFieldsInFormOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  // toggleLabel?: JSX.Element;
}

const UserFieldsInSurveyToggle = ({
  user_fields_in_form,
  handleUserFieldsInFormOnChange,
}: // toggleLabel,
UserFieldsInSurveyToggleProps) => {
  // const { formatMessage } = useIntl();
  const userFieldsInSurveysEnabled = useFeatureFlag({
    name: 'user_fields_in_surveys',
  });

  if (!userFieldsInSurveysEnabled) return null;

  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.userFieldsInSurveyTitle} />
      </SubSectionTitle>
      <Toggle
        checked={user_fields_in_form || false}
        onChange={() => {
          handleUserFieldsInFormOnChange(!user_fields_in_form);
        }}
        label={
          <Box ml="8px" id="e2e-user-fields-in-form-toggle">
            <Box display="flex">
              <Text
                color="primary"
                mb="0px"
                fontSize="m"
                fontWeight="semi-bold"
              >
                <FormattedMessage {...messages.userFieldsInSurveyToggle} />
              </Text>
            </Box>

            <Text color="coolGrey600" mt="0px" fontSize="m">
              <FormattedMessage {...messages.userFieldsInSurveyDescription} />
            </Text>
          </Box>
        }
      />
    </SectionField>
  );
};

export default UserFieldsInSurveyToggle;
