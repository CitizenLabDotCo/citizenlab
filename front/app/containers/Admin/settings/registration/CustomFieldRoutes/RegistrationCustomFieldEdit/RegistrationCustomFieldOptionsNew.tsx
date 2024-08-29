import React from 'react';

import { useParams } from 'react-router-dom';

import useAddUserCustomFieldOption from 'api/user_custom_fields_options/useAddUserCustomFieldOption';

import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import RegistrationCustomFieldOptionsForm, {
  FormValues,
} from './RegistrationCustomFieldOptionsForm';

const RegistrationCustomFieldOptionsNew = () => {
  const { mutate: addUserCustomFieldOption } = useAddUserCustomFieldOption();
  const { userCustomFieldId } = useParams() as { userCustomFieldId: string };

  const handleSubmit = (values: FormValues) => {
    addUserCustomFieldOption(
      {
        customFieldId: userCustomFieldId,
        title_multiloc: values.title_multiloc,
      },
      {
        onSuccess: () => {
          clHistory.push(
            `/admin/settings/registration/custom-fields/${userCustomFieldId}/options/`
          );
        },
      }
    );
  };

  return (
    <Section>
      <SectionTitle>
        <FormattedMessage {...messages.newCustomFieldAnswerOptionFormTitle} />
      </SectionTitle>
      <RegistrationCustomFieldOptionsForm onSubmit={handleSubmit} />
    </Section>
  );
};

export default RegistrationCustomFieldOptionsNew;
