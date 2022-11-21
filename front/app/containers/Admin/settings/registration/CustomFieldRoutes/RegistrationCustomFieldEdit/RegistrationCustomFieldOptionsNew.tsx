import React from 'react';
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { addUserCustomFieldOption } from 'components/UserCustomFields/services/userCustomFieldOptions';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import RegistrationCustomFieldOptionsForm, {
  FormValues,
} from './RegistrationCustomFieldOptionsForm';

const RegistrationCustomFieldOptionsNew = () => {
  const { userCustomFieldId } = useParams() as { userCustomFieldId: string };
  const handleSubmit = async (values: FormValues) => {
    await addUserCustomFieldOption(userCustomFieldId, {
      title_multiloc: values.title_multiloc,
    });

    clHistory.push(
      `/admin/settings/registration/custom-fields/${userCustomFieldId}/options/`
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
